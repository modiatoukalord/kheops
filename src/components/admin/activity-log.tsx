
"use client";

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, DollarSign, Calendar as CalendarIcon, Book, Gamepad2, MicVocal, Phone, Clock, Puzzle, BookCopy, Trash2, Minus, MoreHorizontal, Edit, Eye, Printer, Pyramid, X, CreditCard, User, HandCoins, Loader2, CheckCircle2, Ban, AlertCircle, FileSignature, ChevronsUpDown, Check, Tag, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format, differenceInMinutes, formatDistanceStrict, parse, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Booking } from "@/components/admin/booking-schedule";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Transaction } from "./financial-management";
import type { Contract } from "./contract-management";
import { servicesWithPrices, calculatePrice } from "@/lib/pricing";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { iconMap } from "@/lib/icons";
import type { ActivityCategory } from "./pricing-settings";
import type { Client } from "./client-management";


export type ClientActivity = {
  id: string;
  clientName: string;
  phone?: string;
  description: string;
  category: string;
  totalAmount: number;
  date: Date;
  duration?: string;
  paymentType: "Direct" | "Échéancier" | "Points";
  paidAmount?: number;
  remainingAmount?: number;
  bookingId?: string;
  contractId?: string;
};

interface ActivityLogProps {
  bookings: Booking[];
  contracts: Contract[];
  clients: Client[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateBookingStatus: (bookingId: string, newStatus: Booking['status']) => void;
  onUpdateClient: (clientId: string, clientData: Partial<Omit<Client, 'id'>>) => Promise<void>;
  contractToPay?: Contract | null;
  onContractPaid?: (contractId: string) => void;
}

const activityItemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  category: z.string().min(1, "Catégorie requise"),
  quantity: z.coerce.number().min(1, "Quantité invalide"),
  unitPrice: z.coerce.number().min(0, "Prix invalide"),
  amount: z.coerce.number().min(0), // Total for the line item
  startTime: z.string().optional(),
  endTime: z.string().optional(),
}).refine(data => {
    if (data.startTime && data.endTime) {
        try {
            const start = parse(data.startTime, 'HH:mm', new Date());
            const end = parse(data.endTime, 'HH:mm', new Date());
            return end > start;
        } catch (e) {
            return false;
        }
    }
    return true;
}, {
    message: "L'heure de fin doit être après l'heure de début.",
    path: ["endTime"],
});


const activityFormSchema = z.object({
  clientName: z.string().min(1, "Nom du client requis"),
  phone: z.string().optional(),
  paymentType: z.enum(["Direct", "Échéancier", "Points"], { required_error: "Type de paiement requis" }),
  paidAmount: z.coerce.number().optional(),
  items: z.array(activityItemSchema).min(1, "Veuillez ajouter au moins une activité."),
  contractId: z.string().optional(),
  bookingId: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

const installmentSchema = z.object({
    amount: z.coerce.number().positive("Le montant doit être positif"),
});
type InstallmentFormValues = z.infer<typeof installmentSchema>;


const ActivityLog = forwardRef(({ bookings, contracts = [], clients = [], onAddTransaction, onUpdateBookingStatus, onUpdateClient, contractToPay, onContractPaid }: ActivityLogProps, ref) => {
  const [activities, setActivities] = useState<ClientActivity[]>([]);
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [isActivityDialogOpen, setActivityDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isInstallmentDialogOpen, setInstallmentDialogOpen] = useState(false);
  const [activityForInstallment, setActivityForInstallment] = useState<ClientActivity | null>(null);
  const [detailsActivity, setDetailsActivity] = useState<ClientActivity | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);


  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "activities"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const activitiesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate(),
            } as ClientActivity;
        });
        setActivities(activitiesData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching activities: ", error);
        toast({ title: "Erreur de chargement", description: "Impossible de charger les activités.", variant: "destructive" });
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);
  
  useEffect(() => {
    const q = query(collection(db, "activityCategories"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setActivityCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityCategory)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (contractToPay) {
      handleOpenNewActivityDialog({contract: contractToPay});
    }
  }, [contractToPay]);
  
  useImperativeHandle(ref, () => ({
    openDialog: (data: any) => {
      handleOpenNewActivityDialog({contract: data.contract});
    }
  }));

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      clientName: "",
      phone: "",
      paymentType: "Direct",
      paidAmount: 0,
      items: [{ description: "", category: "Autre", quantity: 1, unitPrice: 0, amount: 0, startTime: "", endTime: "" }],
    },
  });
  
  const installmentForm = useForm<InstallmentFormValues>({
    resolver: zodResolver(installmentSchema),
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const watchedItems = form.watch("items");
  const paymentType = form.watch("paymentType");
  const paidAmount = form.watch("paidAmount");

  const totalAmount = watchedItems.reduce((acc, current) => acc + (current.amount || 0), 0);
  const remainingAmount = paymentType === 'Échéancier' ? totalAmount - (paidAmount || 0) : 0;
  
  const totalPointsCost = useMemo(() => {
    return watchedItems.reduce((acc, item) => {
        const category = activityCategories.find(c => c.name === item.category);
        const pointCost = category?.pointCost || 0;
        return acc + (pointCost * item.quantity);
    }, 0);
  }, [watchedItems, activityCategories]);


  // Auto-calculate amount when quantity or unitPrice changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name && (name.startsWith('items.') && (name.endsWith('.quantity') || name.endsWith('.unitPrice')))) {
        const parts = name.split('.');
        const index = parseInt(parts[1], 10);
        const item = value.items?.[index];
        if (item) {
          const newAmount = (item.quantity || 0) * (item.unitPrice || 0);
          if (item.amount !== newAmount) {
            form.setValue(`items.${index}.amount`, newAmount, { shouldValidate: true });
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);


  const filteredActivities = activities.filter(
    (activity) => {
      const matchesSearch =
        activity.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || isSameDay(activity.date, dateFilter);
      return matchesSearch && matchesDate;
    }
  );
  
  const totalRevenue = activities.reduce((acc, activity) => {
      if (activity.paymentType === 'Direct') {
          return acc + activity.totalAmount;
      } else if (activity.paymentType === 'Échéancier') {
          return acc + (activity.paidAmount || 0);
      }
      return acc;
  }, 0);

  const signedContracts = useMemo(() => {
    return (contracts || []).filter(c => c.status === "Signé");
  }, [contracts]);
  
  const existingClients = clients;

  useEffect(() => {
    const contractId = form.watch("contractId");
    if (!contractId) {
        setSelectedContract(null);
        return;
    }
    const contract = contracts.find(c => c.id === contractId);
    setSelectedContract(contract || null);
    if (contract) {
        form.setValue("clientName", contract.clientName);
    }
  }, [form.watch("contractId"), contracts, form]);

  useEffect(() => {
    const items = form.watch("items");
    items.forEach((item, index) => {
        if (item.category === "Réservation Studio" && selectedContract?.customPrices?.[item.description]) {
            const newPrice = selectedContract.customPrices[item.description];
            if (item.unitPrice !== newPrice) {
                 update(index, { ...item, unitPrice: newPrice });
            }
        }
    });
  }, [form.watch("items"), selectedContract, update]);

  const processActivityData = async (data: ActivityFormValues) => {
    const { clientName, phone, items, paymentType, paidAmount, contractId, bookingId } = data;
    
     const baseActivityPayload = {
      clientName,
      phone,
      paymentType,
      date: new Date(),
    };
    
    if (paymentType === 'Points') {
        if (!selectedClient) {
            toast({ title: "Erreur", description: "Aucun client sélectionné pour le paiement par points.", variant: "destructive" });
            return;
        }
        if (selectedClient.loyaltyPoints < totalPointsCost) {
            toast({ title: "Erreur", description: "Points de fidélité insuffisants.", variant: "destructive" });
            return;
        }

        // Create a "Reward" expense transaction
        const transactionPayload: Omit<Transaction, 'id'> = {
            date: format(new Date(), 'yyyy-MM-dd'),
            description: `Achat par points: ${items.map(i => i.description).join(', ')} - ${clientName}`,
            type: 'Dépense',
            category: "Autre", // Or a specific "Reward" category
            amount: -totalAmount, // The monetary value of the points used
            status: 'Complété'
        };
        onAddTransaction(transactionPayload);

        // Deduct points from client
        await onUpdateClient(selectedClient.id, {
            loyaltyPoints: selectedClient.loyaltyPoints - totalPointsCost
        });
    }

    const activityTransactionMapping: { [key: string]: Transaction['category'] } = {
        "Réservation Studio": "Prestation Studio",
        "Paiement Contrat": "Prestation Studio", // Or a specific category
        "Abonnement": "Abonnement",
    };

    const newActivitiesPromises = items.map(item => {
        let duration: string | null = null;
        if (item.startTime && item.endTime) {
            try {
                const start = parse(item.startTime, 'HH:mm', new Date());
                const end = parse(item.endTime, 'HH:mm', new Date());
                if (end > start) {
                     duration = formatDistanceStrict(end, start, { locale: fr, unit: 'minute' });
                }
            } catch (e) { console.error("Invalid time format for duration calculation"); }
        }
        
        const activityPayload: Omit<ClientActivity, 'id' | 'duration'> & { date: Date, contractId?: string, bookingId?: string, duration?: string } = {
            ...baseActivityPayload,
            description: item.description,
            category: item.category,
            totalAmount: item.amount,
            paidAmount: paymentType === 'Direct' || paymentType === 'Points' ? item.amount : (paidAmount || 0),
            remainingAmount: paymentType === 'Échéancier' ? item.amount - (paidAmount || 0) : 0,
        };

        if (duration) {
            activityPayload.duration = duration;
        }

        if (contractId) {
            activityPayload.contractId = contractId;
        }
        
        if (bookingId) {
            activityPayload.bookingId = bookingId;
        }

        if (paymentType !== 'Points') {
            const transactionPayload: Omit<Transaction, 'id'> = {
                date: format(new Date(), 'yyyy-MM-dd'),
                description: `Vente: ${item.description} - ${clientName}`,
                type: 'Revenu',
                category: activityTransactionMapping[item.category] || "Vente",
                amount: paymentType === 'Échéancier' ? (paidAmount || 0) : item.amount,
                status: 'Complété'
            };
            onAddTransaction(transactionPayload);
        }

        return addDoc(collection(db, "activities"), activityPayload);
    });

    try {
        await Promise.all(newActivitiesPromises);
        toast({
          title: "Activités Ajoutées",
          description: `${items.length} activité(s) pour "${clientName}" ont été ajoutées.`,
        });
        if (contractId && onContractPaid) {
          onContractPaid(contractId);
        }
        if (bookingId) {
            onUpdateBookingStatus(bookingId, 'Payé');
        }
    } catch (error) {
        console.error("Error adding documents: ", error);
        toast({ title: "Erreur", description: "Impossible d'ajouter les activités.", variant: "destructive" });
    }

    setActivityDialogOpen(false);
    form.reset({
        clientName: "",
        phone: "",
        paymentType: "Direct",
        paidAmount: 0,
        items: [{ description: "", category: "Autre", quantity: 1, unitPrice: 0, amount: 0, startTime: "", endTime: "" }],
    });
    setSelectedClient(null);
  };

  const handleOpenNewActivityDialog = ({ contract, booking }: { contract?: Contract | null, booking?: Booking | null } = {}) => {
     if (contract) {
        form.reset({
            clientName: contract.clientName,
            phone: '',
            paymentType: "Direct",
            paidAmount: contract.value,
            items: [{
                description: `Paiement Contrat: ${contract.type} (${contract.id.substring(0, 5)})`,
                category: "Paiement Contrat",
                quantity: 1,
                unitPrice: contract.value,
                amount: contract.value,
                startTime: '',
                endTime: ''
            }],
            contractId: contract.id,
        });
    } else if (booking) {
         form.reset({
            clientName: booking.artistName,
            phone: booking.phone || '',
            paymentType: "Direct",
            paidAmount: booking.amount,
            items: [{
                description: `Paiement Réservation: ${booking.projectName} (${booking.service})`,
                category: "Réservation Studio",
                quantity: booking.tracks?.length || 1,
                unitPrice: booking.amount / (booking.tracks?.length || 1),
                amount: booking.amount,
                startTime: '',
                endTime: ''
            }],
            bookingId: booking.id,
        });
    } else {
        form.reset({
            clientName: "",
            phone: "",
            paymentType: "Direct",
            paidAmount: 0,
            items: [{ description: "", category: "Autre", quantity: 1, unitPrice: 0, amount: 0, startTime: "", endTime: "" }],
            contractId: undefined,
            bookingId: undefined,
        });
    }
    setSelectedClient(null);
    setActivityDialogOpen(true);
  }
  
  const handleDeleteActivity = async (activityId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette activité ? Cette action est irréversible.")) {
        return;
    }
    try {
        await deleteDoc(doc(db, "activities", activityId));
        toast({
            title: "Activité Supprimée",
            description: "L'activité a été supprimée avec succès.",
            variant: "destructive"
        });
    } catch (error) {
        console.error("Error deleting document: ", error);
        toast({ title: "Erreur", description: "Impossible de supprimer l'activité.", variant: "destructive" });
    }
  };
  
  const handleOpenInstallmentDialog = (activity: ClientActivity) => {
      setActivityForInstallment(activity);
      installmentForm.setValue('amount', activity.remainingAmount || 0);
      setInstallmentDialogOpen(true);
  };

  const handleInstallmentSubmit = async (data: InstallmentFormValues) => {
      if (!activityForInstallment) return;

      const newPaidAmount = (activityForInstallment.paidAmount || 0) + data.amount;
      const newRemainingAmount = activityForInstallment.totalAmount - newPaidAmount;

      if (newRemainingAmount < 0) {
          toast({ title: "Erreur de Paiement", description: "Le montant versé dépasse le montant restant.", variant: "destructive"});
          return;
      }

      try {
          const activityRef = doc(db, "activities", activityForInstallment.id);
          await updateDoc(activityRef, {
              paidAmount: newPaidAmount,
              remainingAmount: newRemainingAmount,
          });

          // Create transaction for this installment
          const transactionPayload: Omit<Transaction, 'id'> = {
              date: format(new Date(), 'yyyy-MM-dd'),
              description: `Échéance: ${activityForInstallment.description} - ${activityForInstallment.clientName}`,
              type: 'Revenu',
              category: activityForInstallment.category === "Réservation Studio" ? "Prestation Studio" : "Vente",
              amount: data.amount,
              status: 'Complété'
          };
          onAddTransaction(transactionPayload);

          toast({
              title: "Paiement Enregistré",
              description: `Un nouveau versement de ${data.amount.toLocaleString('fr-FR')} FCFA a été enregistré.`,
          });
          
          if (activityForInstallment.contractId && newRemainingAmount <= 0 && onContractPaid) {
            onContractPaid(activityForInstallment.contractId);
          }
      } catch (error) {
          console.error("Error updating document: ", error);
          toast({ title: "Erreur", description: "Impossible d'enregistrer le paiement.", variant: "destructive" });
      }

      setInstallmentDialogOpen(false);
      setActivityForInstallment(null);
      installmentForm.reset();
  };
  
  const handleCancelPayment = async (bookingId: string) => {
      const relatedActivitiesToDelete = activities.filter(act => act.bookingId === bookingId);
      
      if (relatedActivitiesToDelete.length === 0) {
          toast({ title: "Aucun paiement trouvé", description: "Aucun paiement à annuler pour cette réservation.", variant: "destructive" });
          return;
      }

      if (!window.confirm("Êtes-vous sûr de vouloir annuler le(s) paiement(s) pour cette réservation ?")) {
          return;
      }

      try {
          const deletePromises = relatedActivitiesToDelete.map(act => deleteDoc(doc(db, "activities", act.id)));
          await Promise.all(deletePromises);
          
          await onUpdateBookingStatus(bookingId, 'En attente');
          
          toast({
              title: "Paiement Annulé",
              description: "Le paiement pour cette réservation a été annulé et le statut de la réservation a été mis à jour.",
              variant: "destructive"
          });
      } catch (error) {
          console.error("Error deleting payment activities: ", error);
          toast({ title: "Erreur", description: "Impossible d'annuler le paiement.", variant: "destructive" });
      }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const getCategoryDisplay = (categoryName: string) => {
    const category = activityCategories.find(c => c.name === categoryName);
    if (!category) {
        return { Icon: Tag, color: "bg-gray-500/20 text-gray-700 border-gray-500/30" };
    }
    const Icon = iconMap[category.icon] || Tag;
    const color = `bg-${category.color}-500 text-white`;
    return { Icon, color };
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nombre d'Activités</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{activities.length}</div>
                <p className="text-xs text-muted-foreground">Nombre total de transactions enregistrées</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenu Total Encaissé</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalRevenue.toLocaleString('fr-FR')} FCFA</div>
                <p className="text-xs text-muted-foreground">Revenu total généré par les services ponctuels</p>
            </CardContent>
        </Card>
      </section>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Journal d'Activité</CardTitle>
              <CardDescription>
                Suivez toutes les activités et achats des clients.
              </CardDescription>
            </div>
             <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Rechercher par client ou description..."
                    className="pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-[200px] justify-start text-left font-normal", !dateFilter && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, "PPP", { locale: fr }) : <span>Filtrer par date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFilter}
                        onSelect={setDateFilter}
                        initialFocus
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                  {dateFilter && <Button variant="ghost" size="icon" onClick={() => setDateFilter(undefined)}><X className="h-4 w-4"/></Button>}
                
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">Activités Diverses</TabsTrigger>
                    <TabsTrigger value="studio">Encaissement Studio</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="pt-4">
                    <div className="flex justify-end mb-4">
                        <Dialog open={isActivityDialogOpen} onOpenChange={(isOpen) => {
                            setActivityDialogOpen(isOpen);
                            if (!isOpen) {
                                form.reset();
                                setSelectedClient(null);
                                if (contractToPay && onContractPaid) {
                                onContractPaid(contractToPay.id); // A bit of a hack to reset state
                                }
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button onClick={() => handleOpenNewActivityDialog({})}>
                                    <PlusCircle className="mr-2 h-4 w-4"/>
                                    Ajouter une vente
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-3xl">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(processActivityData)}>
                                    <DialogHeader>
                                        <DialogTitle>Ajouter une nouvelle vente/activité</DialogTitle>
                                        <DialogDescription>
                                            Remplissez les informations du client et ajoutez un ou plusieurs articles/services.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-6 py-4 max-h-[80vh] overflow-y-auto pr-4">
                                        <FormField control={form.control} name="contractId" render={({ field }) => (
                                            <FormItem>
                                                <Label>Contrat Associé (Optionnel)</Label>
                                                <Select onValueChange={(value) => { field.onChange(value === 'none' ? undefined : value); if (value === 'none') { form.reset({ ...form.getValues(), clientName: '' }); setSelectedContract(null); } }} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un contrat..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">Sans Contrat</SelectItem>
                                                        {signedContracts.map(c => <SelectItem key={c.id} value={c.id}>{c.clientName} - {c.type}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage/>
                                            </FormItem>
                                        )} />
                                        { !selectedContract &&
                                        <Tabs defaultValue="existing-client">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="existing-client">Client Existant</TabsTrigger>
                                            <TabsTrigger value="new-client">Nouveau Client</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="existing-client" className="pt-4">
                                            <FormItem>
                                                <Label>Sélectionner un client</Label>
                                                <Select onValueChange={(clientName) => {
                                                        const client = existingClients.find(c => c.name === clientName);
                                                        if (client) {
                                                            form.setValue("clientName", client.name);
                                                            form.setValue("phone", client.phone || '');
                                                            setSelectedClient(client);
                                                        } else {
                                                            setSelectedClient(null);
                                                        }
                                                    }}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Choisir parmi les clients enregistrés..." /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {existingClients.map(client => (
                                                                <SelectItem key={client.id} value={client.name}>{client.name} ({client.loyaltyPoints} pts)</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                </Select>
                                            </FormItem>
                                        </TabsContent>
                                        <TabsContent value="new-client" className="pt-4 space-y-4">
                                            <FormField control={form.control} name="clientName" render={({ field }) => (<FormItem><Label>Nom du nouveau client</Label><FormControl><Input placeholder="Ex: Jean Dupont" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </TabsContent>
                                        </Tabs>
                                        }
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><Label>Téléphone</Label><FormControl><Input placeholder="Ex: +242 06 123 4567" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="paymentType" render={({ field }) => (<FormItem><Label>Type de paiement</Label>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Direct">Direct</SelectItem>
                                                        <SelectItem value="Échéancier">Échéancier</SelectItem>
                                                        <SelectItem value="Points" disabled={!selectedClient || selectedClient.loyaltyPoints < totalPointsCost}>
                                                            Payer avec les points ({totalPointsCost} pts)
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select><FormMessage /></FormItem>)} />
                                        </div>
                                        {selectedClient && (
                                            <div className="text-sm font-medium text-muted-foreground flex items-center justify-end gap-2">
                                                <Star className="h-4 w-4 text-yellow-400"/>
                                                Solde de points du client: <span className="font-bold text-foreground">{selectedClient.loyaltyPoints}</span>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="space-y-4">
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="p-3 border rounded-lg space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-medium text-primary">Article #{index + 1}</h4>
                                                        {fields.length > 1 && (
                                                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                                        )}
                                                    </div>
                                                    <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (<FormItem><Label>Description</Label><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <FormField control={form.control} name={`items.${index}.category`} render={({ field: categoryField }) => (
                                                            <FormItem>
                                                                <Label>Catégorie</Label>
                                                                <Select 
                                                                    onValueChange={(value) => {
                                                                        categoryField.onChange(value);
                                                                        const category = activityCategories.find(c => c.name === value);
                                                                        if (category) {
                                                                            form.setValue(`items.${index}.unitPrice`, category.unitPrice || 0);
                                                                        }
                                                                    }} 
                                                                    defaultValue={categoryField.value}>
                                                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                                    <SelectContent>{activityCategories.map(cat => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}</SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />
                                                        <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (<FormItem><Label>Quantité</Label><FormControl><Input type="number" {...field} min="1" /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => (<FormItem><Label>Prix Unitaire</Label><FormControl><Input type="number" {...field} readOnly className="bg-muted/50" /></FormControl><FormMessage /></FormItem>)} />
                                                    </div>
                                                    <FormField control={form.control} name={`items.${index}.amount`} render={({ field }) => (<FormItem><Label>Montant Total</Label><FormControl><Input type="number" {...field} readOnly className="bg-muted/50" /></FormControl><FormMessage /></FormItem>)} />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField control={form.control} name={`items.${index}.startTime`} render={({ field }) => (<FormItem><Label>Heure de début</Label><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={form.control} name={`items.${index}.endTime`} render={({ field }) => (<FormItem><Label>Heure de fin</Label><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    </div>
                                                </div>
                                            ))}
                                            <Button type="button" size="sm" variant="outline" onClick={() => append({ description: "", category: "Autre", quantity: 1, unitPrice: 0, amount: 0, startTime: "", endTime: "" })}>
                                                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un article
                                            </Button>
                                        </div>
                                        {(paymentType === 'Échéancier') && (
                                            <FormField control={form.control} name="paidAmount" render={({ field }) => (
                                                <FormItem>
                                                    <Label>Montant Versé initialement</Label>
                                                    <FormControl><Input type="number" {...field} value={field.value || 0} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        )}

                                        <Separator />
                                        <div className="flex justify-end items-center gap-6 text-lg font-bold">
                                            {paymentType === 'Échéancier' && (
                                                <>
                                                    <div className="text-right">
                                                        <span>Restant:</span>
                                                        <p className="text-red-500">{remainingAmount.toLocaleString('fr-FR')} FCFA</p>
                                                    </div>
                                                    <Separator orientation="vertical" className="h-10" />
                                                </>
                                            )}
                                            {paymentType === 'Points' ? (
                                                <div className="text-right">
                                                    <span>Coût Total en Points:</span>
                                                    <p className="text-primary flex items-center justify-end gap-1.5">{totalPointsCost} <Star className="h-5 w-5"/></p>
                                                </div>
                                            ) : (
                                                <div className="text-right">
                                                    <span>Total:</span>
                                                    <p>{totalAmount.toLocaleString('fr-FR')} FCFA</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter className="pt-4 border-t">
                                        <Button type="submit">Enregistrer la vente</Button>
                                    </DialogFooter>
                                </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="overflow-x-auto">
                        {isLoading ? (
                             <div className="flex items-center justify-center h-48 gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <p className="text-muted-foreground">Chargement des activités...</p>
                            </div>
                        ) : (
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Paiement</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Durée</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredActivities.filter(act => act.category !== 'Réservation Studio').length > 0 ? (
                            filteredActivities.filter(act => act.category !== 'Réservation Studio').map((activity) => {
                                const { Icon, color } = getCategoryDisplay(activity.category);
                                const isInstallmentAndUnpaid = activity.paymentType === 'Échéancier' && (activity.remainingAmount || 0) > 0;
                                return (
                                <TableRow key={activity.id}>
                                <TableCell>
                                    <div className="font-medium">{activity.clientName}</div>
                                    {activity.phone && <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3"/>{activity.phone}</div>}
                                </TableCell>
                                <TableCell>
                                    <p>{activity.description}</p>
                                    <Badge variant="secondary" className={`mt-1 text-white ${color || ''}`}>
                                        <Icon className="mr-1.5 h-3.5 w-3.5" />
                                        {activity.category}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={activity.paymentType === 'Direct' ? 'default' : activity.paymentType === 'Points' ? 'outline' : 'outline'} className={
                                        activity.paymentType === 'Direct' ? 'bg-green-500/80 text-white' 
                                        : activity.paymentType === 'Points' ? 'border-yellow-500 text-yellow-500'
                                        : 'border-blue-500 text-blue-500'}>
                                        {activity.paymentType === 'Points' ? <Star className="mr-1.5 h-3.5 w-3.5"/> : <CreditCard className="mr-1.5 h-3.5 w-3.5"/>}
                                        {activity.paymentType}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    {format(activity.date, "d MMM yyyy", { locale: fr })}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {activity.duration ? (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground"/>
                                            {activity.duration}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                    {activity.paymentType === 'Points' ? (
                                        <div className="flex items-center justify-end gap-1 text-yellow-500">
                                            {activityCategories.find(c=>c.name === activity.category)?.pointCost?.toLocaleString('fr-FR')} <Star className="h-4 w-4"/>
                                        </div>
                                    ) : (
                                        <div className="text-green-600">{activity.totalAmount.toLocaleString('fr-FR')} FCFA</div>
                                    )}
                                    {activity.paymentType === 'Échéancier' && activity.remainingAmount && activity.remainingAmount > 0 && (
                                        <div className="text-xs text-red-500">Reste: {activity.remainingAmount.toLocaleString('fr-FR')} FCFA</div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setDetailsActivity(activity); setDetailsDialogOpen(true); }}>
                                                <Eye className="mr-2 h-4 w-4" /> Voir les détails
                                            </DropdownMenuItem>
                                            {isInstallmentAndUnpaid && (
                                                <DropdownMenuItem onClick={() => handleOpenInstallmentDialog(activity)}>
                                                    <HandCoins className="mr-2 h-4 w-4" /> Encaisser une échéance
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteActivity(activity.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                </TableRow>
                            )})
                            ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                Aucune activité diverse trouvée.
                                </TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                        </Table>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="studio" className="pt-4">
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Artiste</TableHead>
                                    <TableHead>Projet</TableHead>
                                    <TableHead>Date & Heure</TableHead>
                                    <TableHead className="text-right">Montant / Payé</TableHead>
                                    <TableHead className="text-center">Statut Paiement</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.filter(b => b.status === "Confirmé" || b.status === "Payé").length > 0 ? (
                                    bookings.filter(b => b.status === "Confirmé" || b.status === "Payé").map(booking => {
                                        const relatedActivities = activities.filter(act => act.bookingId === booking.id);
                                        const totalPaid = relatedActivities.reduce((sum, act) => sum + (act.paidAmount || 0), 0);
                                        const isFullyPaid = booking.status === 'Payé' || totalPaid >= booking.amount;
                                        const isPartiallyPaid = totalPaid > 0 && totalPaid < booking.amount;
                                        const firstActivity = relatedActivities[0];

                                        return (
                                        <TableRow key={booking.id}>
                                            <TableCell>
                                                <div className="font-medium">{booking.artistName}</div>
                                                <div className="text-xs text-muted-foreground">{booking.phone}</div>
                                            </TableCell>
                                            <TableCell>{booking.projectName}</TableCell>
                                            <TableCell>{format(booking.date, "d MMM yyyy", { locale: fr })} à {booking.timeSlot}</TableCell>
                                            <TableCell className="text-right font-semibold">
                                                <div>{booking.amount.toLocaleString('fr-FR')} FCFA</div>
                                                <div className="text-xs text-green-500 font-normal">Payé: {totalPaid.toLocaleString('fr-FR')} FCFA</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {isFullyPaid ? (
                                                     <Badge className="bg-green-500/80 text-white"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5"/> Payé</Badge>
                                                ) : isPartiallyPaid ? (
                                                     <Badge variant="outline" className="border-blue-500 text-blue-500"><AlertCircle className="mr-1.5 h-3.5 w-3.5"/> Échéancier</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Confirmé</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!isFullyPaid ? (
                                                    <Button size="sm" onClick={() => handleOpenNewActivityDialog({ booking })}>
                                                        <HandCoins className="mr-2 h-4 w-4"/>
                                                        Encaisser
                                                    </Button>
                                                ) : (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                             <DropdownMenuItem onClick={() => { setDetailsActivity(firstActivity); setDetailsDialogOpen(true); }}>
                                                                <Eye className="mr-2 h-4 w-4" /> Voir les détails
                                                            </DropdownMenuItem>
                                                            {!isFullyPaid && firstActivity && firstActivity.paymentType === 'Échéancier' && (
                                                                <DropdownMenuItem onClick={() => handleOpenInstallmentDialog(firstActivity)}>
                                                                    <HandCoins className="mr-2 h-4 w-4" /> Encaisser le reste
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem className="text-red-500" onClick={() => handleCancelPayment(booking.id)}>
                                                                <Ban className="mr-2 h-4 w-4"/>
                                                                Annuler le paiement
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )})
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            Aucune réservation confirmée à encaisser.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      
        <Dialog open={isDetailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent className="sm:max-w-md p-0">
                <div ref={receiptRef} className="p-6 bg-white text-black printable-area">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center gap-3 text-primary">
                           <Pyramid className="h-8 w-8" />
                           <DialogTitle className="text-2xl font-bold font-headline tracking-wider text-black">KHEOPS</DialogTitle>
                        </div>
                        <h3 className="text-xl font-semibold text-center text-gray-800">Reçu d'Activité</h3>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <div className="space-y-2 text-sm text-gray-700">
                            <p><strong>Client:</strong> {detailsActivity?.clientName}</p>
                            {detailsActivity?.phone && <p><strong>Téléphone:</strong> {detailsActivity.phone}</p>}
                            <p><strong>Date:</strong> {detailsActivity ? format(detailsActivity.date, "d MMMM yyyy 'à' HH:mm", { locale: fr }) : ''}</p>
                        </div>
                        <Separator className="bg-gray-300" />
                        <div className="space-y-2">
                           <p className="font-semibold text-gray-800">Détails de la transaction:</p>
                           <div className="p-3 rounded-md bg-gray-100">
                             <div className="flex justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">{detailsActivity?.description}</p>
                                    <p className="text-xs text-gray-500">{detailsActivity?.category} {detailsActivity?.duration && `(${detailsActivity.duration})`}</p>
                                </div>
                                <p className="font-semibold text-gray-900">{detailsActivity?.totalAmount.toLocaleString('fr-FR')} FCFA</p>
                             </div>
                           </div>
                        </div>
                         <div className="text-sm text-gray-700">
                            <p><strong>Type de paiement:</strong> {detailsActivity?.paymentType}</p>
                        </div>
                        {detailsActivity?.paymentType === 'Échéancier' && (
                             <div className="p-3 rounded-md border border-gray-200 text-sm">
                                <div className="flex justify-between"><span>Montant Versé:</span> <span className="font-medium">{detailsActivity.paidAmount?.toLocaleString('fr-FR')} FCFA</span></div>
                                <div className="flex justify-between font-bold text-red-600"><span>Montant Restant:</span> <span>{detailsActivity.remainingAmount?.toLocaleString('fr-FR')} FCFA</span></div>
                             </div>
                        )}
                        <Separator className="bg-gray-300"/>
                        <div className="flex justify-end font-bold text-lg text-black">
                            <p>TOTAL: {detailsActivity?.totalAmount.toLocaleString('fr-FR')} FCFA</p>
                        </div>
                    </div>
                    <DialogDescription className="text-center text-xs text-gray-500">
                        Merci de votre visite.
                    </DialogDescription>
                </div>
                <DialogFooter className="p-6 pt-0 border-t no-print">
                    <Button onClick={handlePrintReceipt}>
                        <Printer className="mr-2 h-4 w-4"/>
                        Imprimer le reçu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isInstallmentDialogOpen} onOpenChange={setInstallmentDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <Form {...installmentForm}>
                    <form onSubmit={installmentForm.handleSubmit(handleInstallmentSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Encaisser une Échéance</DialogTitle>
                            <DialogDescription>
                                Enregistrez un nouveau versement pour {activityForInstallment?.clientName}.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-6">
                            <div className="p-4 rounded-lg border bg-muted/50">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total de la facture:</span>
                                    <span className="font-medium">{activityForInstallment?.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Déjà versé:</span>
                                    <span className="font-medium">{activityForInstallment?.paidAmount?.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                                <Separator className="my-2"/>
                                <div className="flex justify-between font-bold text-base">
                                    <span>Montant Restant:</span>
                                    <span className="text-red-500">{activityForInstallment?.remainingAmount?.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                            </div>
                             <FormField
                                control={installmentForm.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Montant à verser</Label>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setInstallmentDialogOpen(false)}>Annuler</Button>
                            <Button type="submit">Enregistrer le versement</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
        
        <style jsx global>{`
            @page {
                size: auto;
                margin: 0mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                    visibility: hidden;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: white;
                }
                .printable-area, .printable-area * {
                    visibility: visible;
                }
                .printable-area {
                    position: static;
                    width: 100%;
                    max-width: 400px;
                    margin: auto;
                    box-shadow: none;
                    border: 1px solid #ccc;
                }
                .no-print {
                    display: none;
                }
            }
        `}</style>
    </div>
  );
});

ActivityLog.displayName = "ActivityLog";
export default ActivityLog;

    