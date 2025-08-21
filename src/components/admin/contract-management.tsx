
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
import { MoreHorizontal, Send, PenSquare, Download, Clock, CheckCircle2, FileText, PlusCircle, Trash2, FileUp, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

const initialContracts = [
    { id: "ctr-001", bookingId: "res-001", clientName: "KHEOPS Collective", status: "Signé" as const, lastUpdate: "2024-07-25", pdfFile: null },
    { id: "ctr-002", bookingId: "res-003", clientName: "Mc Solaar", status: "Envoyé" as const, lastUpdate: "2024-08-01", pdfFile: null },
    { id: "ctr-003", bookingId: "res-002", clientName: "L'Artiste Anonyme", status: "En attente" as const, lastUpdate: "2024-08-03", pdfFile: null },
];

// Mock data, in a real app this would come from a shared service or store
const allBookings = [
  { id: "res-001", artistName: "KHEOPS Collective" },
  { id: "res-002", artistName: "L'Artiste Anonyme" },
  { id: "res-003", artistName: "Mc Solaar" },
  { id: "res-004", artistName: "Aya Nakamura" },
  { id: "res-005", artistName: "Damso" },
];

const contractStatusConfig = {
    "En attente": { variant: "secondary", icon: Clock },
    "Envoyé": { variant: "outline", icon: Send },
    "Signé": { variant: "default", icon: CheckCircle2 },
    "Archivé": { variant: "ghost", icon: FileText },
};

type ContractStatus = keyof typeof contractStatusConfig;
type Contract = {
    id: string;
    bookingId: string;
    clientName: string;
    status: "Signé" | "Envoyé" | "En attente" | "Archivé";
    lastUpdate: string;
    pdfFile: File | null;
};

export default function ContractManagement() {
    const [contracts, setContracts] = useState<Contract[]>(initialContracts);
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
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
        if (!selectedBookingId) {
             toast({
                title: "Erreur",
                description: "Veuillez sélectionner une réservation.",
                variant: "destructive"
            });
            return;
        }

        const booking = allBookings.find(b => b.id === selectedBookingId);
        if (!booking) return;

        const newContract: Contract = {
            id: `ctr-${Date.now()}`,
            bookingId: booking.id,
            clientName: booking.artistName,
            status: "En attente",
            lastUpdate: format(new Date(), 'yyyy-MM-dd'),
            pdfFile: pdfFile,
        };

        setContracts(prev => [newContract, ...prev]);
        toast({
            title: "Contrat Ajouté",
            description: `Le contrat pour ${booking.artistName} a été créé.`,
        });

        setAddDialogOpen(false);
        setSelectedBookingId(null);
        setPdfFile(null);
    };

    const handleEditContract = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editingContract) return;

        const formData = new FormData(event.currentTarget);
        const clientName = formData.get("clientName") as string;

        setContracts(contracts.map(c => 
            c.id === editingContract.id 
            ? { ...c, clientName, pdfFile: pdfFile ?? c.pdfFile, lastUpdate: format(new Date(), 'yyyy-MM-dd') } 
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

    const bookingsWithoutContract = allBookings.filter(
        booking => !contracts.some(contract => contract.bookingId === booking.id)
    );

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
                    <DialogContent>
                        <form onSubmit={handleAddContract}>
                            <DialogHeader>
                                <DialogTitle>Créer un nouveau contrat</DialogTitle>
                                <DialogDescription>Sélectionnez une réservation et ajoutez un PDF pour générer un nouveau contrat.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                               <div className="space-y-2">
                                    <Label htmlFor="booking">Réservation</Label>
                                    <Select onValueChange={setSelectedBookingId}>
                                        <SelectTrigger id="booking">
                                            <SelectValue placeholder="Sélectionner une réservation..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bookingsWithoutContract.length > 0 ? (
                                                bookingsWithoutContract.map(booking => (
                                                    <SelectItem key={booking.id} value={booking.id}>{booking.artistName} - (ID: {booking.id})</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>Aucune réservation sans contrat</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
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
                                <Button type="submit" disabled={!selectedBookingId}>Créer le contrat</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Contrat</TableHead>
                            <TableHead>Mise à jour</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contracts.length > 0 ? contracts.map(contract => {
                            const statusInfo = contractStatusConfig[contract.status];
                            return (
                                <TableRow key={contract.id}>
                                    <TableCell>{contract.clientName}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-sm">{contract.id}</span>
                                            {contract.pdfFile && <span className="text-xs text-muted-foreground">{contract.pdfFile.name}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Date(contract.lastUpdate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</TableCell>
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
                                <TableCell colSpan={5} className="text-center h-24">Aucun contrat trouvé.</TableCell>
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
                <DialogContent>
                    <form onSubmit={handleEditContract}>
                        <DialogHeader>
                            <DialogTitle>Modifier le contrat</DialogTitle>
                            <DialogDescription>Mettez à jour le nom du client ou le fichier PDF pour le contrat de {editingContract?.clientName}.</DialogDescription>
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
