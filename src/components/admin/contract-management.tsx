"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Send, PenSquare, Download, Clock, CheckCircle2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const initialContracts = [
    { id: "ctr-001", bookingId: "res-001", artistName: "KHEOPS Collective", status: "Signé", lastUpdate: "2024-07-25" },
    { id: "ctr-002", bookingId: "res-003", artistName: "Mc Solaar", status: "Envoyé", lastUpdate: "2024-08-01" },
    { id: "ctr-003", bookingId: "res-002", artistName: "L'Artiste Anonyme", status: "En attente", lastUpdate: "2024-08-03" },
];

const contractStatusConfig = {
    "En attente": { variant: "secondary", icon: Clock },
    "Envoyé": { variant: "outline", icon: Send },
    "Signé": { variant: "default", icon: CheckCircle2 },
    "Archivé": { variant: "ghost", icon: FileText },
};

type ContractStatus = keyof typeof contractStatusConfig;

export default function ContractManagement() {
    const [contracts, setContracts] = useState(initialContracts);
    const { toast } = useToast();

    const handleContractStatusChange = (contractId: string, newStatus: ContractStatus) => {
        setContracts(contracts.map(c => c.id === contractId ? { ...c, status: newStatus, lastUpdate: format(new Date(), 'yyyy-MM-dd') } : c));
         toast({
            title: "Statut du contrat mis à jour",
            description: `Le statut du contrat ${contractId} est maintenant: ${newStatus}.`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestion des Contrats</CardTitle>
                <CardDescription>Suivez et mettez à jour le statut des contrats de réservation.</CardDescription>
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
                        {contracts.map(contract => {
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
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
