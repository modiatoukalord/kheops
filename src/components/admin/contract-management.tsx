
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Send, PenSquare, Download, Clock, CheckCircle2, FileText, PlusCircle, Trash2, FileUp, Edit, DollarSign, Calendar as CalendarIcon, HandCoins, Info, Eye, Printer, Sparkles, Loader2 } from "lucide-react";
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
import { Booking } from "@/components/admin/booking-schedule";
import { servicesWithPrices } from "@/lib/pricing";
import ContractView from "./contract-view";
import { Textarea } from "@/components/ui/textarea";
import { generateContractClause } from "@/ai/flows/contract-clause-flow";
import type { GenerateContractClauseInput } from "@/ai/types/contract-clause";


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

const contractTypes = ["Prestation Studio", "Licence Musique", "Distribution", "Partenariat", "Autres"];

type ContractStatus = keyof typeof contractStatusConfig;
type PaymentStatus = keyof typeof paymentStatusConfig;
type ContractType = typeof contractTypes[number];

export type Contract = {
    id: string;
    bookingId?: string;
    clientName: string;
    status: "Signé" | "Envoyé" | "En attente" | "Archivé";
    lastUpdate: string;
    pdfFile?: File | null; // Making this optional
    pdfUrl?: string;
    value: number;
    paymentStatus: PaymentStatus;
    type: ContractType;
    startDate?: Date;
    endDate?: Date;
    customPrices?: { [key: string]: number };
    object?: string;
    obligationsProvider?: string;
    obligationsClient?: string;
    confidentiality?: string;
};

interface ContractManagementProps {
  onUpdateContract: (id: string, data: Partial<Omit<Contract, 'id'>>) => Promise<void>;
  onCollectPayment: (contract: Contract) => void;
}


export default function ContractManagement({ onUpdateContract, onCollectPayment }: ContractManagementProps) {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setViewDialogOpen]  = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [viewingContract, setViewingContract] = useState<Contract | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const { toast } = useToast();
    const [generatingClause, setGeneratingClause] = useState<string | null>(null);

    const objectRef = React.useRef<HTMLTextAreaElement>(null);
    const obligationsProviderRef = React.useRef<HTMLTextAreaElement>(null);
    const obligationsClientRef = React.useRef<HTMLTextAreaElement>(null);
    const confidentialityRef = React.useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      const q = query(collection(db, "contracts"), orderBy("lastUpdate", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
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
      return () => unsubscribe();
    }, []);

    useEffect(() => {
      const q = query(collection(db, "bookings"), orderBy("date", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate()
            } as Booking;
        });
        setBookings(bookingsData);
      });
       return () => unsubscribe();
    }, []);
    
    const handleGenerateClause = async (clauseType: GenerateContractClauseInput['clauseType'], contractType: string) => {
        setGeneratingClause(clauseType);
        try {
            const clauseText = await generateContractClause({ contractType, clauseType });
            
            let targetRef: React.RefObject<HTMLTextAreaElement> | null = null;
            switch(clauseType) {
                case 'object': targetRef = objectRef; break;
                case 'obligationsProvider': targetRef = obligationsProviderRef; break;
                case 'obligationsClient': targetRef = obligationsClientRef; break;
                case 'confidentiality': targetRef = confidentialityRef; break;
            }

            if (targetRef?.current) {
                targetRef.current.value = clauseText;
            }

            toast({
                title: "Clause Générée",
                description: `La clause "${clauseType}" a été générée par l'IA.`,
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
    
    const handleAddContract = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const formData = new FormData(event.currentTarget);
        const bookingIdOrClientName = formData.get("bookingId") as string;
        
        if (!bookingIdOrClientName) {
             toast({
                title: "Erreur",
                description: "Veuillez saisir un ID de réservation ou un nom de client.",
                variant: "destructive"
            });
            return;
        }

        const booking = bookings.find(b => b.id === bookingIdOrClientName);
        
        let clientName = booking ? booking.artistName : bookingIdOrClientName;
        let bookingId = booking ? booking.id : undefined;

        if (bookingId && contracts.some(c => c.bookingId === bookingId)) {
             toast({
                title: "Erreur",
                description: "Un contrat existe déjà pour cette réservation.",
                variant: "destructive"
            });
            return;
        }
        
        const customPrices: { [key: string]: number } = {};
        Object.keys(servicesWithPrices).forEach(service => {
            const price = formData.get(`price-${service}`) as string;
            if (price) {
                customPrices[service] = Number(price);
            }
        });


        const newContractData: Omit<Contract, 'id' | 'bookingId'> & {bookingId?: string} = {
            clientName: clientName,
            status: "En attente",
            lastUpdate: format(new Date(), 'yyyy-MM-dd'),
            value: Number(formData.get("value")) || 0,
            paymentStatus: (formData.get("paymentStatus") as PaymentStatus) || 'N/A',
            type: formData.get("type") as ContractType,
            startDate: dateRange?.from,
            endDate: dateRange?.to,
            customPrices: Object.keys(customPrices).length > 0 ? customPrices : undefined,
            object: formData.get("object") as string,
            obligationsProvider: formData.get("obligationsProvider") as string,
            obligationsClient: formData.get("obligationsClient") as string,
            confidentiality: formData.get("confidentiality") as string,
        };

        if (bookingId) {
            newContractData.bookingId = bookingId;
        }


        try {
            await addDoc(collection(db, "contracts"), newContractData);
            toast({
                title: "Contrat Ajouté",
                description: `Le contrat pour ${clientName} a été créé.`,
            });
            setAddDialogOpen(false);
            setPdfFile(null);
            setDateRange(undefined);
        } catch (error) {
             console.error("Error adding contract: ", error);
             toast({ title: "Erreur", description: "Impossible d'ajouter le contrat.", variant: "destructive"});
        }
    };

    const handleEditContract = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingContract) return;

        const formData = new FormData(event.currentTarget);
        const clientName = formData.get("clientName") as string;
        const value = Number(formData.get("value")) || 0;
        const paymentStatus = (formData.get("paymentStatus") as PaymentStatus) || 'N/A';
        const type = formData.get("type") as ContractType;

        const customPrices: { [key: string]: number } = {};
        Object.keys(servicesWithPrices).forEach(service => {
            const price = formData.get(`price-${service}`) as string;
            if (price) {
                customPrices[service] = Number(price);
            }
        });

        const updatedData: Partial<Contract> = {
            clientName, 
            value, 
            paymentStatus, 
            type, 
            lastUpdate: format(new Date(), 'yyyy-MM-dd'),
            startDate: dateRange?.from,
            endDate: dateRange?.to,
            customPrices: Object.keys(customPrices).length > 0 ? customPrices : undefined,
            object: formData.get("object") as string,
            obligationsProvider: formData.get("obligationsProvider") as string,
            obligationsClient: formData.get("obligationsClient") as string,
            confidentiality: formData.get("confidentiality") as string,
        };

        try {
            await updateDoc(doc(db, "contracts", editingContract.id), updatedData as any);
             toast({
                title: "Contrat mis à jour",
                description: `Le contrat pour ${editingContract.clientName} a été mis à jour.`,
            });
            setEditDialogOpen(false);
            setEditingContract(null);
            setPdfFile(null);
            setDateRange(undefined);
        } catch (error) {
            console.error("Error updating contract: ", error);
            toast({ title: "Erreur", description: "Impossible de modifier le contrat.", variant: "destructive"});
        }
    };

    const handleOpenEditDialog = (contract: Contract) => {
        setEditingContract(contract);
        setDateRange({ from: contract.startDate, to: contract.endDate });
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
            toast({
                title: "Contrat Supprimé",
                description: `Le contrat ${contractId} a été supprimé.`,
                variant: "destructive"
            });
        } catch (error) {
            console.error("Error deleting contract: ", error);
            toast({ title: "Erreur", description: "Impossible de supprimer le contrat.", variant: "destructive" });
        }
    };

    const handlePrintContract = () => {
        window.print();
    };
    
    const renderContractFormFields = (contract?: Contract | null) => {
        const typeValue = (document.querySelector('[name="type"]') as HTMLSelectElement)?.value || contract?.type || "Prestation Studio";
        
        const ClauseField = ({ name, label, reference, defaultValue }: { name: GenerateContractClauseInput['clauseType'], label: string, reference: React.RefObject<HTMLTextAreaElement>, defaultValue?: string }) => (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor={name}>{label}</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGenerateClause(name, typeValue)}
                        disabled={!!generatingClause}
                        className="gap-2 text-accent hover:text-accent"
                    >
                        {generatingClause === name ? (
                            <Loader2 className="h-4 w-4 animate-spin"/>
                        ) : (
                            <Sparkles className="h-4 w-4" />
                        )}
                        Générer avec l'IA
                    </Button>
                </div>
                <Textarea id={name} name={name} ref={reference} defaultValue={defaultValue} placeholder={`Définir ${label.toLowerCase()}...`} />
            </div>
        );

        return (
            <div className="grid gap-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
                <div className="space-y-2">
                    <Label htmlFor="bookingId">Client ou Réservation ID</Label>
                    <Input id="bookingId" name="bookingId" placeholder="Ex: res-001 ou Nom du Client" required defaultValue={contract?.bookingId || contract?.clientName} disabled={!!contract} />
                </div>
                <div className="space-y-2">
                    <Label>Durée du contrat (Début - Fin)</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                            )}
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
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            locale={fr}
                        />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type de contrat</Label>
                        <Select name="type" defaultValue={contract?.type || "Prestation Studio"} required>
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Type..." />
                            </SelectTrigger>
                            <SelectContent>{contractTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="paymentStatus">Statut Paiement</Label>
                        <Select name="paymentStatus" defaultValue={contract?.paymentStatus || "En attente"}>
                            <SelectTrigger id="paymentStatus">
                                <SelectValue placeholder="Statut..." />
                            </SelectTrigger>
                            <SelectContent>{Object.keys(paymentStatusConfig).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="value">Valeur Globale du Contrat (FCFA)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="value" name="value" type="number" placeholder="Ex: 150000" className="pl-10" defaultValue={contract?.value}/>
                    </div>
                </div>
                
                <ClauseField name="object" label="Objet du contrat" reference={objectRef} defaultValue={contract?.object} />
                <ClauseField name="obligationsProvider" label="Obligations du prestataire" reference={obligationsProviderRef} defaultValue={contract?.obligationsProvider} />
                <ClauseField name="obligationsClient" label="Obligations du client" reference={obligationsClientRef} defaultValue={contract?.obligationsClient} />
                <ClauseField name="confidentiality" label="Clause de confidentialité" reference={confidentialityRef} defaultValue={contract?.confidentiality} />

                <div className="space-y-4 pt-4 border-t">
                    <Label className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        Tarifs de Prestation Personnalisés (Optionnel)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.keys(servicesWithPrices).map(service => (
                            <div className="space-y-1" key={service}>
                                <Label htmlFor={`price-${service}`} className="text-xs">{service}</Label>
                                <Input
                                    id={`price-${service}`}
                                    name={`price-${service}`}
                                    type="number"
                                    placeholder={servicesWithPrices[service as keyof typeof servicesWithPrices].toLocaleString('fr-FR')}
                                    defaultValue={contract?.customPrices?.[service]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
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

    const studioContracts = contracts.filter(c => c.type === "Prestation Studio");
    const partnerContracts = contracts.filter(c => c.type !== "Prestation Studio");


    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle>Gestion des Contrats</CardTitle>
                    <CardDescription>Suivez et mettez à jour le statut des contrats de réservation.</CardDescription>
                </div>
                 <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { setAddDialogOpen(isOpen); if (!isOpen) setDateRange(undefined); }}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter un contrat
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <form onSubmit={handleAddContract}>
                            <DialogHeader>
                                <DialogTitle>Créer un nouveau contrat</DialogTitle>
                                <DialogDescription>Saisissez l'ID de réservation ou le nom du client et remplissez les détails pour générer un nouveau contrat.</DialogDescription>
                            </DialogHeader>
                            {renderContractFormFields(null)}
                            <DialogFooter className="pt-4 border-t">
                                <Button onClick={() => setAddDialogOpen(false)} variant="ghost" type="button">Annuler</Button>
                                <Button type="submit">Créer le contrat</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="studio">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="studio">Contrats Studio</TabsTrigger>
                        <TabsTrigger value="partners">Contrats Partenaires</TabsTrigger>
                    </TabsList>
                    <TabsContent value="studio">
                        {renderContractTable(studioContracts)}
                    </TabsContent>
                    <TabsContent value="partners">
                        {renderContractTable(partnerContracts)}
                    </TabsContent>
                </Tabs>
            </CardContent>
             {contracts.length === 0 && (
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">Cliquez sur "Ajouter un contrat" pour commencer.</p>
                </CardFooter>
            )}
             <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { setEditDialogOpen(isOpen); if (!isOpen) setDateRange(undefined); }}>
                <DialogContent className="sm:max-w-2xl">
                    <form onSubmit={handleEditContract}>
                        <DialogHeader>
                            <DialogTitle>Modifier le contrat</DialogTitle>
                            <DialogDescription>Mettez à jour les informations pour le contrat de {editingContract?.clientName}.</DialogDescription>
                        </DialogHeader>
                        {renderContractFormFields(editingContract)}
                        <DialogFooter className="pt-4 border-t">
                            <Button onClick={() => setEditDialogOpen(false)} variant="ghost" type="button">Annuler</Button>
                            <Button type="submit">Enregistrer les modifications</Button>
                        </DialogFooter>
                    </form>
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

    