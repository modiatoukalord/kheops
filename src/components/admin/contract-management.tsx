
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Send, PenSquare, Download, Clock, CheckCircle2, FileText, PlusCircle, Trash2, FileUp, Edit, DollarSign, Calendar as CalendarIcon, HandCoins, Info, Eye, Printer, Sparkles, Loader2, ChevronsUpDown, FileSignature } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/firebase";
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { servicesWithPrices } from "@/lib/pricing";
import ContractView from "./contract-view";
import { Textarea } from "@/components/ui/textarea";
import { generateContractClause } from "@/ai/flows/contract-clause-flow";
import type { GenerateContractClauseInput } from "@/ai/types/contract-clause";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Employee } from "./human-resources-management";
import { ContractTypeConfig } from "./pricing-settings";
import { Booking } from "./booking-schedule";


const contractStatusConfig = {
    "En attente": { variant: "secondary", icon: Clock },
    "Envoyé": { variant: "outline", icon: Send },
    "Signé": { variant: "default", icon: CheckCircle2 },
    "Archivé": { variant: "ghost", icon: FileText },
};

const paymentStatusConfig = {
    "Payé": { variant: "default", className: "bg-green-500/80" },
    "Non Payé": { variant: "destructive" },
    "En attente": { variant: "secondary" },
    "Échéancier": { variant: "outline", className: "border-blue-500 text-blue-500" },
    "N/A": { variant: "outline", className: "border-dashed" },
};

type ContractStatus = keyof typeof contractStatusConfig;
type PaymentStatus = keyof typeof paymentStatusConfig;

export type Contract = {
    id: string;
    clientName: string;
    status: "Signé" | "Envoyé" | "En attente" | "Archivé";
    lastUpdate: string;
    pdfFile?: File | null; // Making this optional
    pdfUrl?: string;
    value: number;
    paymentStatus: PaymentStatus;
    type: string;
    startDate?: Date;
    endDate?: Date;
    customPrices?: { [key: string]: number };
    object?: string;
    obligationsProvider?: string;
    obligationsClient?: string;
    confidentiality?: string;
    signatoryId?: string;
    signatoryName?: string;
    paymentTerms?: string;
};

interface ContractManagementProps {
  employees: Employee[];
  onUpdateContract: (id: string, data: Partial<Omit<Contract, 'id'>>) => Promise<void>;
  onCollectPayment: (contract: Contract) => void;
  bookingForContract: Booking | null;
  setBookingForContract: (booking: Booking | null) => void;
}

const contractFormSchema = z.object({
  clientName: z.string().min(1, "Client requis"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  type: z.string().min(1, "Type requis"),
  paymentStatus: z.string().min(1, "Statut de paiement requis"),
  value: z.coerce.number().min(0),
  object: z.string().optional(),
  obligationsProvider: z.string().optional(),
  obligationsClient: z.string().optional(),
  confidentiality: z.string().optional(),
  paymentTerms: z.string().optional(),
  customPrices: z.record(z.coerce.number().optional()).optional(),
  signatoryId: z.string().optional(),
});
type ContractFormValues = z.infer<typeof contractFormSchema>;


export default function ContractManagement({ employees, onUpdateContract, onCollectPayment, bookingForContract, setBookingForContract }: ContractManagementProps) {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [contractTypes, setContractTypes] = useState<ContractTypeConfig[]>([]);
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setViewDialogOpen]  = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [viewingContract, setViewingContract] = useState<Contract | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const { toast } = useToast();
    const [generatingClause, setGeneratingClause] = useState<string | null>(null);

    const form = useForm<ContractFormValues>({
      resolver: zodResolver(contractFormSchema),
      defaultValues: {
        clientName: "",
        type: "Prestation studio",
        paymentStatus: "En attente",
        value: 0,
      }
    });
    

    useEffect(() => {
      const qContracts = query(collection(db, "contracts"), orderBy("lastUpdate", "desc"));
      const unsubContracts = onSnapshot(qContracts, (snapshot) => {
        const contractsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startDate: data.startDate ? (data.startDate as Timestamp).toDate() : undefined,
                endDate: data.endDate ? (data.endDate as Timestamp).toDate() : undefined,
            } as Contract;
        });
        setContracts(contractsData);
      });
      
      const qContractTypes = query(collection(db, "contractTypes"));
        const unsubContractTypes = onSnapshot(qContractTypes, (snapshot) => {
            setContractTypes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContractTypeConfig)));
        });

       return () => {
           unsubContracts();
           unsubContractTypes();
       };
    }, []);

    useEffect(() => {
        if (bookingForContract) {
            form.reset({
                clientName: bookingForContract.artistName,
                type: 'Prestation studio',
                paymentStatus: 'En attente',
                value: bookingForContract.amount,
                object: `Contrat de prestation pour le projet "${bookingForContract.projectName}"`,
            });
            setDateRange({ from: bookingForContract.date, to: undefined });
            setAddDialogOpen(true);
            // Reset bookingForContract after use
            setBookingForContract(null);
        }
    }, [bookingForContract, form, setBookingForContract]);
    
    const handleGenerateClause = async (clauseType: GenerateContractClauseInput['clauseType']) => {
        setGeneratingClause(clauseType);
        const contractType = form.getValues("type");
        const currentText = form.getValues(clauseType);

        try {
            const clauseText = await generateContractClause({ contractType, clauseType, currentText });
            form.setValue(clauseType, clauseText);

            toast({
                title: "Clause Améliorée",
                description: `La clause "${clauseType}" a été mise à jour par l'IA.`,
            });
        } catch (error) {
            console.error("Error generating clause: ", error);
            toast({ title: "Erreur de Génération", description: "Impossible de générer la clause.", variant: "destructive" });
        } finally {
            setGeneratingClause(null);
        }
    };


    const handleContractStatusChange = async (contractId: string, newStatus: ContractStatus) => {
        try {
            await updateDoc(doc(db, "contracts", contractId), { status: newStatus, lastUpdate: format(new Date(), 'yyyy-MM-dd') });
            toast({
                title: "Statut du contrat mis à jour",
                description: `Le statut du contrat ${contractId} est maintenant: ${newStatus}.`,
            });
        } catch (error) {
            console.error("Error updating contract status: ", error);
            toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
        }
    };
    
    const handleAddContract = async (data: ContractFormValues) => {
        const signatory = employees.find(e => e.id === data.signatoryId);

        const newContractData: Omit<Contract, 'id'> = {
            ...data,
            clientName: data.clientName,
            status: "En attente",
            lastUpdate: format(new Date(), 'yyyy-MM-dd'),
            startDate: dateRange?.from,
            endDate: dateRange?.to,
            paymentStatus: data.paymentStatus as PaymentStatus,
            type: data.type,
            signatoryId: data.signatoryId,
            signatoryName: signatory ? signatory.name : undefined,
        };


        try {
            await addDoc(collection(db, "contracts"), newContractData as any);
            toast({ title: "Contrat Ajouté", description: `Le contrat pour ${data.clientName} a été créé.` });
            setAddDialogOpen(false);
            setDateRange(undefined);
            form.reset();
        } catch (error) {
             console.error("Error adding contract: ", error);
             toast({ title: "Erreur", description: "Impossible d'ajouter le contrat.", variant: "destructive"});
        }
    };

    const handleEditContract = async (data: ContractFormValues) => {
        if (!editingContract) return;

        const signatory = employees.find(e => e.id === data.signatoryId);

        const updatedData: Partial<Contract> = {
            ...data,
            lastUpdate: format(new Date(), 'yyyy-MM-dd'),
            startDate: dateRange?.from,
            endDate: dateRange?.to,
            paymentStatus: data.paymentStatus as PaymentStatus,
            type: data.type,
            signatoryId: data.signatoryId,
            signatoryName: signatory ? signatory.name : undefined,
        };

        try {
            await updateDoc(doc(db, "contracts", editingContract.id), updatedData as any);
             toast({ title: "Contrat mis à jour", description: `Le contrat pour ${editingContract.clientName} a été mis à jour.` });
            setEditDialogOpen(false);
            setEditingContract(null);
            setDateRange(undefined);
            form.reset();
        } catch (error) {
            console.error("Error updating contract: ", error);
            toast({ title: "Erreur", description: "Impossible de modifier le contrat.", variant: "destructive"});
        }
    };

    const handleOpenAddDialog = (type: "Prestation studio" | "Autre") => {
        form.reset({
            clientName: "",
            type: type,
            paymentStatus: "En attente",
            value: 0,
        });
        setDateRange(undefined);
        setAddDialogOpen(true);
    };

    const handleOpenEditDialog = (contract: Contract) => {
        setEditingContract(contract);
        setDateRange({ from: contract.startDate, to: contract.endDate });
        form.reset({
          clientName: contract.clientName,
          type: contract.type,
          paymentStatus: contract.paymentStatus,
          value: contract.value,
          object: contract.object,
          obligationsProvider: contract.obligationsProvider,
          obligationsClient: contract.obligationsClient,
          confidentiality: contract.confidentiality,
          paymentTerms: contract.paymentTerms,
          customPrices: contract.customPrices,
          signatoryId: contract.signatoryId,
        });
        setEditDialogOpen(true);
    };

    const handleOpenViewDialog = (contract: Contract) => {
        setViewingContract(contract);
        setViewDialogOpen(true);
    };
    
     const handleDeleteContract = async (contractId: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce contrat?")) return;
        try {
            await deleteDoc(doc(db, "contracts", contractId));
            toast({ title: "Contrat Supprimé", description: `Le contrat ${contractId} a été supprimé.`, variant: "destructive" });
        } catch (error) {
            console.error("Error deleting contract: ", error);
            toast({ title: "Erreur", description: "Impossible de supprimer le contrat.", variant: "destructive" });
        }
    };

    const handlePrintContract = () => {
        window.print();
    };
    
    const ClauseField = ({ name, label }: { name: "object" | "obligationsProvider" | "obligationsClient" | "confidentiality" | "paymentTerms", label: string }) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
            <FormItem>
                <div className="flex items-center justify-between">
                    <FormLabel>{label}</FormLabel>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGenerateClause(name)}
                        disabled={!!generatingClause}
                        className="gap-2 text-accent hover:text-accent"
                    >
                        {generatingClause === name ? ( <Loader2 className="h-4 w-4 animate-spin"/> ) : ( <Sparkles className="h-4 w-4" /> )}
                        Générer avec l'IA
                    </Button>
                </div>
                <FormControl>
                    <Textarea placeholder={`Définir ${label.toLowerCase()}...`} {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
    );
        
    const renderContractFormFields = () => {
        const typeValue = form.watch("type");

        return (
            <div className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
                <FormField
                    control={form.control}
                    name="clientName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Client</FormLabel>
                        <FormControl>
                        <Input placeholder="Nom du Client" {...field} required />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <div className="space-y-2">
                    <Label>Durée du contrat (Début - Fin)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "d MMM y", { locale: fr })} - {format(dateRange.to, "d MMM y", { locale: fr })}
                                    </>
                                ) : (
                                    format(dateRange.from, "d MMM y", { locale: fr })
                                )
                            ) : (
                                <span>Choisir les dates</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={fr} />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  { typeValue !== 'Prestation studio' && 
                    <FormField control={form.control} name="type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de contrat</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} required>
                          <FormControl><SelectTrigger><SelectValue placeholder="Type..." /></SelectTrigger></FormControl>
                          <SelectContent>
                              <SelectItem value="Prestation studio">Prestation studio</SelectItem>
                              <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  }
                  <FormField control={form.control} name="paymentStatus" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut Paiement</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} required>
                        <FormControl><SelectTrigger><SelectValue placeholder="Statut..." /></SelectTrigger></FormControl>
                        <SelectContent>{Object.keys(paymentStatusConfig).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="value" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valeur (FCFA)</FormLabel>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl><Input type="number" placeholder="Ex: 150000" className="pl-10" {...field} /></FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="signatoryId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Signataire (KHEOPS)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Choisir un signataire..."/></SelectTrigger></FormControl>
                                <SelectContent>
                                    {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name} ({e.role})</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <FormMessage />
                        </FormItem>
                    )} />
                </div>
                
                <ClauseField name="object" label="Objet du contrat" />
                <ClauseField name="obligationsProvider" label="Obligations du prestataire" />
                <ClauseField name="obligationsClient" label="Obligations du client" />
                <ClauseField name="confidentiality" label="Clause de confidentialité" />
                <ClauseField name="paymentTerms" label="Modalités de Paiement" />


                {typeValue === "Prestation studio" && (
                    <div className="space-y-4 pt-4 border-t">
                        <Label className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            Tarifs de Prestation Personnalisés (Optionnel)
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.keys(servicesWithPrices).map(service => (
                              <FormField key={service} control={form.control} name={`customPrices.${service}`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">{service}</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder={servicesWithPrices[service as keyof typeof servicesWithPrices].toLocaleString('fr-FR')}
                                      {...field}
                                      onChange={e => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
                                      value={field.value ?? ''}
                                    />
                                  </FormControl>
                                </FormItem>
                              )} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    };

    const renderContractTable = (contractList: Contract[]) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Contrat ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Paiement</TableHead>
                    <TableHead>Statut Contrat</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {contractList.length > 0 ? contractList.map(contract => {
                    const statusInfo = contractStatusConfig[contract.status];
                    const paymentInfo = paymentStatusConfig[contract.paymentStatus];
                    return (
                        <TableRow key={contract.id}>
                            <TableCell>
                                <div className="font-mono text-xs">{contract.id}</div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{contract.clientName}</div>
                            </TableCell>
                            <TableCell>
                                {contract.startDate ? (
                                    <div>
                                        <div className="font-medium text-sm">{format(contract.startDate, "d MMM yyyy", { locale: fr })}</div>
                                        <div className="text-xs text-muted-foreground">au {contract.endDate ? format(contract.endDate, "d MMM yyyy", { locale: fr }) : '...'}</div>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground text-xs">Non défini</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="font-semibold">{contract.value.toLocaleString('fr-FR')} FCFA</div>
                                <div className="text-xs text-muted-foreground">{contract.type}</div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={paymentInfo.variant} className={paymentInfo.className}>{contract.paymentStatus}</Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant={statusInfo.variant}>
                                    <statusInfo.icon className="mr-2 h-3.5 w-3.5" />
                                    {contract.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right flex justify-end items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenViewDialog(contract)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Voir le contrat
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleOpenEditDialog(contract)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Modifier
                                        </DropdownMenuItem>
                                         {contract.status === "Signé" && contract.paymentStatus !== "Payé" && (
                                            <DropdownMenuItem onClick={() => onCollectPayment(contract)}>
                                                <HandCoins className="mr-2 h-4 w-4" />
                                                Encaisser
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleContractStatusChange(contract.id, "Envoyé")}><Send className="mr-2 h-4 w-4" />Marquer comme Envoyé</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleContractStatusChange(contract.id, "Signé")}><PenSquare className="mr-2 h-4 w-4" />Marquer comme Signé</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteContract(contract.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Supprimer
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    )
                }) : (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">Aucun contrat trouvé.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
    
    const studioContracts = contracts.filter(c => c.type === 'Prestation studio');
    const partnerContracts = contracts.filter(c => c.type !== 'Prestation studio');


    return (
        <Card>
            <CardHeader>
                <div className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle>Gestion des Contrats</CardTitle>
                        <CardDescription>Suivez et mettez à jour le statut des contrats.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="studio">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="studio">Contrats Studio</TabsTrigger>
                        <TabsTrigger value="partners">Contrats Partenaires &amp; Autres</TabsTrigger>
                    </TabsList>
                    <TabsContent value="studio" className="space-y-4">
                        <div className="flex justify-end pt-4">
                            <Button onClick={() => handleOpenAddDialog('Prestation studio')}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter un contrat Studio
                            </Button>
                        </div>
                        {renderContractTable(studioContracts)}
                    </TabsContent>
                    <TabsContent value="partners" className="space-y-4">
                        <div className="flex justify-end pt-4">
                            <Button onClick={() => handleOpenAddDialog('Autre')}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter un contrat Partenaire/Autre
                            </Button>
                        </div>
                        {renderContractTable(partnerContracts)}
                    </TabsContent>
                </Tabs>
            </CardContent>
             {contracts.length === 0 && (
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">Cliquez sur "Ajouter un contrat" pour commencer.</p>
                </CardFooter>
            )}
            <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setDateRange(undefined); form.reset(); } setAddDialogOpen(isOpen); }}>
                <DialogContent className="sm:max-w-2xl">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddContract)}>
                            <DialogHeader>
                                <DialogTitle>Créer un nouveau contrat</DialogTitle>
                                <DialogDescription>Saisissez le nom du client et remplissez les détails pour générer un nouveau contrat.</DialogDescription>
                            </DialogHeader>
                            {renderContractFormFields()}
                            <DialogFooter className="pt-4 border-t">
                                <Button onClick={() => setAddDialogOpen(false)} variant="ghost" type="button">Annuler</Button>
                                <Button type="submit">Créer le contrat</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
             <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setDateRange(undefined); form.reset(); } setEditDialogOpen(isOpen); }}>
                <DialogContent className="sm:max-w-2xl">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleEditContract)}>
                          <DialogHeader>
                              <DialogTitle>Modifier le contrat</DialogTitle>
                              <DialogDescription>Mettez à jour les informations pour le contrat de {editingContract?.clientName}.</DialogDescription>
                          </DialogHeader>
                          {renderContractFormFields()}
                          <DialogFooter className="pt-4 border-t">
                              <Button onClick={() => setEditDialogOpen(false)} variant="ghost" type="button">Annuler</Button>
                              <Button type="submit">Enregistrer les modifications</Button>
                          </DialogFooter>
                      </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <Dialog open={isViewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-4 pb-0 sr-only">
                        <DialogTitle>Vue du contrat pour {viewingContract?.clientName}</DialogTitle>
                        <DialogDescription>Aperçu du contrat pour {viewingContract?.clientName}</DialogDescription>
                    </DialogHeader>
                     <div className="flex-grow overflow-y-auto">
                        {viewingContract && <ContractView contract={viewingContract} />}
                    </div>
                    <DialogFooter className="p-4 border-t sm:justify-between bg-background/80 backdrop-blur-sm no-print">
                        <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Fermer</Button>
                        <Button onClick={handlePrintContract}><Printer className="mr-2 h-4 w-4" /> Imprimer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
