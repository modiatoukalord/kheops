
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Send, PenSquare, Download, Clock, CheckCircle2, FileText, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const initialContracts = [
    { id: "ctr-001", bookingId: "res-001", artistName: "KHEOPS Collective", status: "Signé", lastUpdate: "2024-07-25" },
    { id: "ctr-002", bookingId: "res-003", artistName: "Mc Solaar", status: "Envoyé", lastUpdate: "2024-08-01" },
    { id: "ctr-003", bookingId: "res-002", artistName: "L'Artiste Anonyme", status: "En attente", lastUpdate: "2024-08-03" },
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
type Contract = (typeof initialContracts)[0];

export default function ContractManagement() {
    const [contracts, setContracts] = useState(initialContracts);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const { toast } = useToast();

    const handleContractStatusChange = (contractId: string, newStatus: ContractStatus) => {
        setContracts(contracts.map(c => c.id === contractId ? { ...c, status: newStatus, lastUpdate: format(new Date(), 'yyyy-MM-dd') } : c));
         toast({
            title: "Statut du contrat mis à jour",
            description: `Le statut du contrat ${contractId} est maintenant: ${newStatus}.`,
        });
    };
    
    const handleAddContract = () => {
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
            artistName: booking.artistName,
            status: "En attente",
            lastUpdate: format(new Date(), 'yyyy-MM-dd'),
        };

        setContracts(prev => [newContract, ...prev]);
        toast({
            title: "Contrat Ajouté",
            description: `Le contrat pour ${booking.artistName} a été créé.`,
        });

        setDialogOpen(false);
        setSelectedBookingId(null);
    };
    
     const handleDeleteContract = (contractId: string) => {
        setContracts(contracts.filter(c => c.id !== contractId));
        toast({
            title: "Contrat Supprimé",
            description: `Le contrat ${contractId} a été supprimé.`,
            variant: "destructive"
        });
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
                 <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter un contrat
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Créer un nouveau contrat</DialogTitle>
                            <DialogDescription>Sélectionnez une réservation pour générer un nouveau contrat.</DialogDescription>
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
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setDialogOpen(false)} variant="ghost">Annuler</Button>
                            <Button onClick={handleAddContract} disabled={!selectedBookingId}>Créer le contrat</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Contrat ID</TableHead>
                            <TableHead>Artiste</TableHead>
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
                                    <TableCell className="font-mono">{contract.id}</TableCell>
                                    <TableCell>{contract.artistName}</TableCell>
                                    <TableCell>{new Date(contract.lastUpdate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusInfo.variant}>
                                            <statusInfo.icon className="mr-2 h-3.5 w-3.5" />
                                            {contract.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleContractStatusChange(contract.id, "Envoyé")}><Send className="mr-2 h-4 w-4" />Marquer comme Envoyé</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleContractStatusChange(contract.id, "Signé")}><PenSquare className="mr-2 h-4 w-4" />Marquer comme Signé</DropdownMenuItem>
                                                <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Télécharger PDF</DropdownMenuItem>
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
        </Card>
    );
}
