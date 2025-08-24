
"use client";

import React, { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, DollarSign, Calendar as CalendarIcon, Book, Gamepad2, MicVocal, Phone, Clock, Puzzle, BookCopy, Trash2, Minus, MoreHorizontal, Edit, Eye, Printer, Pyramid, X, CreditCard } from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";


export type ClientActivity = {
  id: string;
  clientName: string;
  phone?: string;
  description: string;
  category: "Livre" | "Manga" | "Jeu de société" | "Session de jeu" | "Réservation Studio" | "Autre";
  amount: number;
  date: Date;
  duration?: string;
  paymentType: "Direct" | "Échéancier";
};

interface ActivityLogProps {
  activities: ClientActivity[];
  setActivities: React.Dispatch<React.SetStateAction<ClientActivity[]>>;
}

const categoryConfig = {
    "Livre": { icon: Book, color: "bg-blue-500/20 text-blue-700 border-blue-500/30" },
    "Manga": { icon: BookCopy, color: "bg-orange-500/20 text-orange-700 border-orange-500/30" },
    "Jeu de société": { icon: Puzzle, color: "bg-green-500/20 text-green-700 border-green-500/30" },
    "Session de jeu": { icon: Gamepad2, color: "bg-red-500/20 text-red-700 border-red-500/30" },
    "Réservation Studio": { icon: MicVocal, color: "bg-purple-500/20 text-purple-700 border-purple-500/30" },
    "Autre": { icon: DollarSign, color: "bg-gray-500/20 text-gray-700 border-gray-500/30" },
};

const activityItemSchema = z.object({
  description: z.string().min(1, "Description requise"),
  category: z.enum(Object.keys(categoryConfig) as [keyof typeof categoryConfig]),
  amount: z.coerce.number().min(0, "Montant invalide"),
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
  paymentType: z.enum(["Direct", "Échéancier"], { required_error: "Type de paiement requis" }),
  items: z.array(activityItemSchema).min(1, "Veuillez ajouter au moins une activité."),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;


export default function ActivityLog({ activities, setActivities }: ActivityLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [isActivityDialogOpen, setActivityDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ClientActivity | null>(null);
  const [detailsActivity, setDetailsActivity] = useState<ClientActivity | null>(null);

  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      clientName: "",
      phone: "",
      paymentType: "Direct",
      items: [{ description: "", category: "Autre", amount: 0, startTime: "", endTime: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const watchedItems = form.watch("items");
  const totalAmount = watchedItems.reduce((acc, current) => acc + (current.amount || 0), 0);


  const filteredActivities = activities.filter(
    (activity) => {
      const matchesSearch =
        activity.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || isSameDay(activity.date, dateFilter);
      return matchesSearch && matchesDate;
    }
  ).sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const totalRevenue = activities.reduce((acc, activity) => acc + activity.amount, 0);

  const processActivityData = (data: ActivityFormValues) => {
    const { clientName, phone, items, paymentType } = data;

    if(editingActivity) {
         const item = items[0];
         let duration;
        if (item.startTime && item.endTime) {
            try {
                const start = parse(item.startTime, 'HH:mm', new Date());
                const end = parse(item.endTime, 'HH:mm', new Date());
                if (end > start) {
                     duration = formatDistanceStrict(end, start, { locale: fr, unit: 'minute' });
                }
            } catch (e) { console.error("Invalid time format"); }
        }
        const updatedActivity: ClientActivity = {
            id: editingActivity.id,
            clientName,
            phone,
            description: item.description,
            category: item.category,
            amount: item.amount,
            date: editingActivity.date, // Keep original date on edit
            duration,
            paymentType,
        };
        setActivities(prev => prev.map(act => act.id === editingActivity.id ? updatedActivity : act));
        toast({
            title: "Activité Modifiée",
            description: `L'activité pour "${clientName}" a été mise à jour.`,
        });
    } else {
        const newActivities: ClientActivity[] = items.map(item => {
            let duration;
            if (item.startTime && item.endTime) {
                try {
                    const start = parse(item.startTime, 'HH:mm', new Date());
                    const end = parse(item.endTime, 'HH:mm', new Date());
                    const diff = differenceInMinutes(end, start);
                    if (diff > 0) {
                         duration = formatDistanceStrict(end, start, { locale: fr, unit: 'minute' });
                    }
                } catch (e) {
                    console.error("Invalid time format for duration calculation");
                    duration = undefined;
                }
            }

            return {
                id: `act-${Date.now()}-${Math.random()}`,
                clientName,
                phone,
                description: item.description,
                category: item.category,
                amount: item.amount,
                date: new Date(),
                duration,
                paymentType,
            }
        });

        setActivities(prev => [...newActivities, ...prev]);
        toast({
          title: "Activités Ajoutées",
          description: `${items.length} activité(s) pour "${clientName}" ont été ajoutées.`,
        });
    }

    setActivityDialogOpen(false);
    setEditingActivity(null);
    form.reset({
        clientName: "",
        phone: "",
        paymentType: "Direct",
        items: [{ description: "", category: "Autre", amount: 0, startTime: "", endTime: "" }],
    });
  };

  const handleOpenDialog = (activity: ClientActivity | null) => {
    if (activity) {
        setEditingActivity(activity);
        form.reset({
            clientName: activity.clientName,
            phone: activity.phone || '',
            paymentType: activity.paymentType,
            items: [{
                description: activity.description,
                category: activity.category,
                amount: activity.amount,
                // Time inputs are not pre-filled for simplicity when editing duration.
                startTime: '', 
                endTime: ''
            }]
        });
    } else {
        setEditingActivity(null);
        form.reset({
            clientName: "",
            phone: "",
            paymentType: "Direct",
            items: [{ description: "", category: "Autre", amount: 0, startTime: "", endTime: "" }],
        });
    }
    setActivityDialogOpen(true);
  }
  
  const handleDeleteActivity = (activityId: string) => {
    setActivities(prev => prev.filter(act => act.id !== activityId));
    toast({
        title: "Activité Supprimée",
        description: "L'activité a été supprimée avec succès.",
        variant: "destructive"
    });
  };

  const handlePrintReceipt = () => {
    window.print();
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
                <CardTitle className="text-sm font-medium">Revenu Total (Activités)</CardTitle>
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
                Suivez toutes les activités et achats des clients non-abonnés.
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
                <Dialog open={isActivityDialogOpen} onOpenChange={(isOpen) => {
                    setActivityDialogOpen(isOpen);
                    if (!isOpen) {
                        setEditingActivity(null);
                        form.reset();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog(null)}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Ajouter
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl">
                       <Form {...form}>
                        <form onSubmit={form.handleSubmit(processActivityData)}>
                            <DialogHeader>
                                <DialogTitle>{editingActivity ? "Modifier l'activité" : "Ajouter une nouvelle vente/activité"}</DialogTitle>
                                <DialogDescription>
                                    {editingActivity ? "Mettez à jour les informations de l'activité." : "Remplissez les informations du client et ajoutez un ou plusieurs articles/services."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4 max-h-[80vh] overflow-y-auto pr-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField control={form.control} name="clientName" render={({ field }) => (<FormItem><Label>Nom du client</Label><FormControl><Input placeholder="Ex: Jean Dupont" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><Label>Téléphone</Label><FormControl><Input placeholder="Ex: +242 06 123 4567" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="paymentType" render={({ field }) => (<FormItem><Label>Type de paiement</Label>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="Direct">Direct</SelectItem><SelectItem value="Échéancier">Échéancier</SelectItem></SelectContent>
                                        </Select><FormMessage /></FormItem>)} />
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-3 border rounded-lg space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-primary">Article #{index + 1}</h4>
                                                {fields.length > 1 && !editingActivity && (
                                                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (<FormItem><Label>Description</Label><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`items.${index}.category`} render={({ field }) => (<FormItem><Label>Catégorie</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{Object.keys(categoryConfig).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <FormField control={form.control} name={`items.${index}.amount`} render={({ field }) => (<FormItem><Label>Montant</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`items.${index}.startTime`} render={({ field }) => (<FormItem><Label>Heure de début</Label><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={form.control} name={`items.${index}.endTime`} render={({ field }) => (<FormItem><Label>Heure de fin</Label><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            </div>
                                            {editingActivity && <p className="text-xs text-muted-foreground">La date et l'heure de modification n'affectent pas la date d'enregistrement originale.</p>}
                                        </div>
                                    ))}
                                    {!editingActivity && (
                                    <Button type="button" size="sm" variant="outline" onClick={() => append({ description: "", category: "Autre", amount: 0, startTime: "", endTime: "" })}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un article
                                    </Button>
                                    )}
                                </div>

                                <Separator />
                                <div className="flex justify-end items-center gap-4 text-lg font-bold">
                                    <span>Total:</span>
                                    <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                            </div>
                            <DialogFooter className="pt-4 border-t">
                                <Button type="submit">{editingActivity ? "Enregistrer les modifications" : "Enregistrer la vente"}</Button>
                            </DialogFooter>
                        </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity) => {
                    const catInfo = categoryConfig[activity.category];
                    return (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="font-medium">{activity.clientName}</div>
                        {activity.phone && <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3"/>{activity.phone}</div>}
                      </TableCell>
                      <TableCell>
                        <p>{activity.description}</p>
                        <Badge variant="secondary" className={`mt-1 ${catInfo?.color || ''}`}>
                            {catInfo?.icon && <catInfo.icon className="mr-1.5 h-3.5 w-3.5" />}
                            {activity.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={activity.paymentType === 'Direct' ? 'default' : 'outline'} className={activity.paymentType === 'Direct' ? 'bg-green-500/80 text-white' : 'border-blue-500 text-blue-500'}>
                            <CreditCard className="mr-1.5 h-3.5 w-3.5"/>
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
                      <TableCell className="text-right font-semibold text-green-600">
                          {activity.amount.toLocaleString('fr-FR')} FCFA
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
                                <DropdownMenuItem onClick={() => handleOpenDialog(activity)}>
                                    <Edit className="mr-2 h-4 w-4" /> Modifier
                                </DropdownMenuItem>
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
                      Aucune activité trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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
                                <p className="font-semibold text-gray-900">{detailsActivity?.amount.toLocaleString('fr-FR')} FCFA</p>
                             </div>
                           </div>
                        </div>
                         <div className="text-sm text-gray-700">
                            <p><strong>Type de paiement:</strong> {detailsActivity?.paymentType}</p>
                        </div>
                        <Separator className="bg-gray-300"/>
                        <div className="flex justify-end font-bold text-lg text-black">
                            <p>TOTAL: {detailsActivity?.amount.toLocaleString('fr-FR')} FCFA</p>
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
}

    
