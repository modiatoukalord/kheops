
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Landmark, ArrowUpRight, ArrowDownLeft, PlusCircle, Search, Calendar, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export type Transaction = {
  id: string;
  date: string;
  description: string;
  type: "Revenu" | "Dépense";
  amount: number;
  status: "Complété" | "En attente" | "Annulé";
};

export const initialTransactions: Transaction[] = [
    { id: "txn-001", date: "2024-07-25", description: "Abonnement Premium - F. N'diaye", type: "Revenu", amount: 15000, status: "Complété" },
    { id: "txn-002", date: "2024-07-24", description: "Achat matériel studio (micros)", type: "Dépense", amount: -150000, status: "Complété" },
    { id: "txn-003", date: "2024-07-23", description: "Paiement location espace", type: "Dépense", amount: -250000, status: "Complété" },
    { id: "txn-004", date: "2024-07-22", description: "Réservation studio - K. Collective", type: "Revenu", amount: 75000, status: "Complété" },
    { id: "txn-005", date: "2024-07-21", description: "Abonnement Membre - B. Traoré", type: "Revenu", amount: 5000, status: "En attente" },
    { id: "txn-006", date: "2024-06-15", description: "Abonnement Premium - M. Sow", type: "Revenu", amount: 15000, status: "Complété" },
];

const monthlyChartData = [
  { name: 'Jan', Revenus: 400000, Dépenses: 240000 },
  { name: 'Fév', Revenus: 300000, Dépenses: 139800 },
  { name: 'Mar', Revenus: 500000, Dépenses: 380000 },
  { name: 'Avr', Revenus: 478000, Dépenses: 290800 },
  { name: 'Mai', Revenus: 689000, Dépenses: 480000 },
  { name: 'Juin', Revenus: 640000, Dépenses: 380000 },
  { name: 'Juil', Revenus: 720000, Dépenses: 430000 },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
  "Complété": "default",
  "En attente": "secondary",
  "Annulé": "destructive",
};

interface FinancialManagementProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

export default function FinancialManagement({ transactions, setTransactions }: FinancialManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddTransaction = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const description = formData.get("description") as string;
    
    toast({
        title: "Transaction Ajoutée",
        description: `La transaction "${description}" a été ajoutée avec succès.`,
    });
    setDialogOpen(false);
  };
  
  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalRevenue = transactions.filter(t => t.type === 'Revenu').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'Dépense').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalRevenue + totalExpenses;

  const summaryCards = [
    { title: "Revenu Total (brut)", value: `${totalRevenue.toLocaleString('fr-FR')} FCFA`, icon: Landmark, change: "+15% ce mois", color: "text-green-500" },
    { title: "Dépenses Totales", value: `${Math.abs(totalExpenses).toLocaleString('fr-FR')} FCFA`, icon: ArrowDownLeft, change: "+5% ce mois", color: "text-red-500" },
    { title: "Bénéfice Net", value: `${netProfit.toLocaleString('fr-FR')} FCFA`, icon: ArrowUpRight, change: "+20% ce mois", color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
       <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summaryCards.map(card => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                        <card.icon className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className={`text-xs ${card.color}`}>{card.change}</p>
                    </CardContent>
                </Card>
            ))}
       </section>

       <Card>
            <CardHeader>
                <CardTitle>Flux de trésorerie mensuel</CardTitle>
                <CardDescription>Comparaison des revenus et dépenses sur les derniers mois.</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)"/>
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))"/>
                        <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${Number(value) / 1000}k`}/>
                        <Tooltip
                             contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                borderColor: 'hsl(var(--border))',
                                color: 'hsl(var(--foreground))'
                            }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Revenus" stroke="hsl(var(--primary))" strokeWidth={2} name="Revenus"/>
                        <Line type="monotone" dataKey="Dépenses" stroke="hsl(var(--destructive))" strokeWidth={2} name="Dépenses"/>
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
       </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Historique des Transactions</CardTitle>
              <CardDescription>Suivez toutes les transactions financières enregistrées.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une transaction..."
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filtrer</Button>
               <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" />Ajouter</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleAddTransaction}>
                            <DialogHeader>
                                <DialogTitle>Ajouter une Transaction</DialogTitle>
                                <DialogDescription>Remplissez les détails de la nouvelle transaction.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="description" className="text-right">Description</Label>
                                    <Input id="description" name="description" placeholder="Ex: Achat de matériel" className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="amount" className="text-right">Montant</Label>
                                    <Input id="amount" name="amount" type="number" placeholder="Ex: 50000" className="col-span-3" required />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">Type</Label>
                                    <Select name="type" required>
                                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Sélectionner un type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="revenu">Revenu</SelectItem>
                                            <SelectItem value="depense">Dépense</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Enregistrer</Button>
                            </DialogFooter>
                        </form>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant (FCFA)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                           <Calendar className="h-4 w-4 text-muted-foreground" />
                           {new Date(transaction.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>
                        <Badge variant={transaction.type === 'Revenu' ? 'secondary' : 'destructive'} className={`${transaction.type === 'Revenu' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-red-500/20 text-red-700 border-red-500/30'}`}>{transaction.type}</Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant={statusVariant[transaction.status] || "default"}>{transaction.status}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                        {transaction.amount.toLocaleString('fr-FR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
