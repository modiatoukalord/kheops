
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Send, PenSquare, Download, Clock, CheckCircle2, FileText, PlusCircle, Trash2, FileUp, Edit, DollarSign, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

const initialContracts = [
    { id: "ctr-001", bookingId: "res-001", clientName: "KHEOPS Collective", status: "Signé" as const, lastUpdate: "2024-07-25", pdfFile: null, value: 100000, paymentStatus: "Payé", type: "Prestation Studio" },
    { id: "ctr-002", bookingId: "res-003", clientName: "Mc Solaar", status: "Envoyé" as const, lastUpdate: "2024-08-01", pdfFile: null, value: 150000, paymentStatus: "Non Payé", type: "Prestation Studio" },
    { id: "ctr-003", bookingId: "res-002", clientName: "L'Artiste Anonyme", status: "En attente" as const, lastUpdate: "2024-08-03", pdfFile: null, value: 60000, paymentStatus: "En attente", type: "Prestation Studio" },
];

// Mock data, in a real app this would come from a shared service or store
const allBookings = [
  { id: "res-001", artistName: "KHEOPS Collective", amount: 100000 },
  { id: "res-002", artistName: "L'Artiste Anonyme", amount: 60000 },
  { id: "res-003", artistName: "Mc Solaar", amount: 150000 },
  { id: "res-004", artistName: "Aya Nakamura", amount: 60000 },
  { id: "res-005", artistName: "Damso", amount: 100000 },
];

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
    "N/A": { variant: "outline", className: "border-dashed" },
};

const contractTypes = ["Prestation Studio", "Licence Musique", "Distribution", "Partenariat", "Autres"];

type ContractStatus = keyof typeof contractStatusConfig;
type PaymentStatus = keyof typeof paymentStatusConfig;
type ContractType = typeof contractTypes[number];

type Contract = {
    id: string;
    bookingId: string;
    clientName: string;
    status: "Signé" | "Envoyé" | "En attente" | "Archivé";
    lastUpdate: string;
    pdfFile: File | null;
    value: number;
    paymentStatus: PaymentStatus;
    type: ContractType;
};

export default function ContractManagement() {
    const [contracts, setContracts] = useState<Contract[]>(initialContracts);
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const { toast } = useToast();

    const handleContractStatusChange = (contractId: string, newStatus: ContractStatus) => {
        setContracts(contracts.map(c => c.id === contractId ? { ...c, status: newStatus, lastUpdate: format(new Date(), 'yyyy-MM-dd') } : c));
         toast({
            title: "Statut du contrat mis à jour",
            description: `Le statut du contrat ${contractId} est maintenant: ${newStatus}.`,
        });
    };
    
    const handleAddContract = (event: React.FormEvent<HTMLFormElement>) => {
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

        const booking = allBookings.find(b => b.id === bookingIdOrClientName);
        
        let clientName = booking ? booking.artistName : bookingIdOrClientName;
        let bookingId = booking ? booking.id : `client-${Date.now()}`;

        if (contracts.some(c => c.bookingId === bookingId && booking)) {
             toast({
                title: "Erreur",
                description: "Un contrat existe déjà pour cette réservation.",
                variant: "destructive"
            });
            return;
        }

        const newContract: Contract = {
            id: `ctr-${Date.now()}`,
            bookingId: bookingId,
            clientName: clientName,
            status: "En attente",
            lastUpdate: format(new Date(), 'yyyy-MM-dd'),
            pdfFile: pdfFile,
            value: Number(formData.get("value")) || 0,
            paymentStatus: (formData.get("paymentStatus") as PaymentStatus) || 'N/A',
            type: formData.get("type") as ContractType,
        };

        setContracts(prev => [newContract, ...prev]);
        toast({
            title: "Contrat Ajouté",
            description: `Le contrat pour ${clientName} a été créé.`,
        });

        setAddDialogOpen(false);
        setPdfFile(null);
    };

    const handleEditContract = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingContract) return;

        const formData = new FormData(event.currentTarget);
        const clientName = formData.get("clientName") as string;
        const value = Number(formData.get("value")) || 0;
        const paymentStatus = (formData.get("paymentStatus") as PaymentStatus) || 'N/A';
        const type = formData.get("type") as ContractType;

        setContracts(contracts.map(c => 
            c.id === editingContract.id 
            ? { ...c, clientName, value, paymentStatus, type, pdfFile: pdfFile ?? c.pdfFile, lastUpdate: format(new Date(), 'yyyy-MM-dd') } 
            : c
        ));

        toast({
            title: "Contrat mis à jour",
            description: `Le contrat pour ${editingContract.clientName} a été mis à jour.`,
        });

        setEditDialogOpen(false);
        setEditingContract(null);
        setPdfFile(null);
    };

    const handleOpenEditDialog = (contract: Contract) => {
        setEditingContract(contract);
        setPdfFile(contract.pdfFile);
        setEditDialogOpen(true);
    };
    
     const handleDeleteContract = (contractId: string) => {
        setContracts(contracts.filter(c => c.id !== contractId));
        toast({
            title: "Contrat Supprimé",
            description: `Le contrat ${contractId} a été supprimé.`,
            variant: "destructive"
        });
    };

    const handleViewPdf = (file: File) => {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
        URL.revokeObjectURL(url);
    };
    
    const handleDownloadPdf = (file: File) => {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle>Gestion des Contrats</CardTitle>
                    <CardDescription>Suivez et mettez à jour le statut des contrats de réservation.</CardDescription>
                </div>
                 <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter un contrat
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handleAddContract}>
                            <DialogHeader>
                                <DialogTitle>Créer un nouveau contrat</DialogTitle>
                                <DialogDescription>Saisissez l'ID de réservation et remplissez les détails pour générer un nouveau contrat.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                               <div className="space-y-2">
                                    <Label htmlFor="bookingId">Client ou Réservation</Label>
                                    <Input id="bookingId" name="bookingId" placeholder="Ex: res-001 ou Nom du Client" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type de contrat</Label>
                                        <Select name="type" defaultValue="Prestation Studio" required>
                                            <SelectTrigger id="type">
                                                <SelectValue placeholder="Type..." />
                                            </SelectTrigger>
                                            <SelectContent>{contractTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentStatus">Statut Paiement</Label>
                                        <Select name="paymentStatus" defaultValue="En attente">
                                            <SelectTrigger id="paymentStatus">
                                                <SelectValue placeholder="Statut..." />
                                            </SelectTrigger>
                                            <SelectContent>{Object.keys(paymentStatusConfig).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="value">Valeur du Contrat (FCFA)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input id="value" name="value" type="number" placeholder="Ex: 150000" className="pl-10" />
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="pdf-upload">PDF du Contrat (Optionnel)</Label>
                                    <div className="flex items-center gap-2">
                                        <FileUp className="h-5 w-5 text-muted-foreground" />
                                        <Input 
                                            id="pdf-upload" 
                                            type="file" 
                                            accept="application/pdf"
                                            onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)}
                                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setAddDialogOpen(false)} variant="ghost" type="button">Annuler</Button>
                                <Button type="submit">Créer le contrat</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Contrat ID</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Valeur</TableHead>
                            <TableHead>Paiement</TableHead>
                            <TableHead>Statut Contrat</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contracts.length > 0 ? contracts.map(contract => {
                            const statusInfo = contractStatusConfig[contract.status];
                            const paymentInfo = paymentStatusConfig[contract.paymentStatus];
                            return (
                                <TableRow key={contract.id}>
                                    <TableCell>
                                        <div className="font-mono text-sm">{contract.id}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{contract.clientName}</div>
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
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            disabled={!contract.pdfFile}
                                            onClick={() => contract.pdfFile && handleViewPdf(contract.pdfFile)}
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span className="sr-only">Voir le contrat</span>
                                        </Button>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenEditDialog(contract)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleContractStatusChange(contract.id, "Envoyé")}><Send className="mr-2 h-4 w-4" />Marquer comme Envoyé</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleContractStatusChange(contract.id, "Signé")}><PenSquare className="mr-2 h-4 w-4" />Marquer comme Signé</DropdownMenuItem>
                                                <DropdownMenuItem disabled={!contract.pdfFile} onClick={() => contract.pdfFile && handleDownloadPdf(contract.pdfFile)}><Download className="mr-2 h-4 w-4" />Télécharger PDF</DropdownMenuItem>
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
                                <TableCell colSpan={6} className="text-center h-24">Aucun contrat trouvé.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
             {contracts.length === 0 && (
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">Cliquez sur "Ajouter un contrat" pour commencer.</p>
                </CardFooter>
            )}
             <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={handleEditContract}>
                        <DialogHeader>
                            <DialogTitle>Modifier le contrat</DialogTitle>
                            <DialogDescription>Mettez à jour les informations pour le contrat de {editingContract?.clientName}.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="clientName-edit">Nom du Client</Label>
                                <Input 
                                    id="clientName-edit" 
                                    name="clientName"
                                    defaultValue={editingContract?.clientName}
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type-edit">Type de contrat</Label>
                                    <Select name="type" defaultValue={editingContract?.type} required>
                                        <SelectTrigger id="type-edit"><SelectValue placeholder="Type..." /></SelectTrigger>
                                        <SelectContent>{contractTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="paymentStatus-edit">Statut Paiement</Label>
                                    <Select name="paymentStatus" defaultValue={editingContract?.paymentStatus}>
                                        <SelectTrigger id="paymentStatus-edit"><SelectValue placeholder="Statut..." /></SelectTrigger>
                                        <SelectContent>{Object.keys(paymentStatusConfig).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value-edit">Valeur du Contrat (FCFA)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="value-edit" name="value" type="number" placeholder="Ex: 150000" className="pl-10" defaultValue={editingContract?.value} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pdf-upload-edit">PDF du Contrat</Label>
                                <div className="flex items-center gap-2">
                                    <FileUp className="h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        id="pdf-upload-edit" 
                                        type="file" 
                                        accept="application/pdf"
                                        onChange={(e) => setPdfFile(e.target.files ? e.target.files[0] : null)}
                                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                    />
                                </div>
                                {pdfFile && <p className="text-sm text-muted-foreground mt-2">Nouveau fichier: {pdfFile.name}</p>}
                                {!pdfFile && editingContract?.pdfFile && <p className="text-sm text-muted-foreground mt-2">Fichier actuel: {editingContract.pdfFile.name}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setEditDialogOpen(false)} variant="ghost" type="button">Annuler</Button>
                            <Button type="submit">Enregistrer les modifications</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

    

    

    


