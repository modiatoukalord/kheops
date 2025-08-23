
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Trash2, Edit, Home, Users, Zap, Wrench, Building, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export type FixedCostCategory = "Loyer" | "Salaires" | "Électricité" | "Maintenance" | "Autre";

export type FixedCost = {
  id: string;
  name: string;
  category: FixedCostCategory;
  amount: number;
  paymentDate: Date;
  frequency: "Mensuel" | "Trimestriel" | "Annuel";
};

export const initialFixedCosts: FixedCost[] = [
  { id: "fc-001", name: "Loyer Espace KHEOPS", category: "Loyer", amount: 250000, paymentDate: new Date("2024-07-01"), frequency: "Mensuel" },
  { id: "fc-002", name: "Salaires Équipe (Juillet)", category: "Salaires", amount: 500000, paymentDate: new Date("2024-07-25"), frequency: "Mensuel" },
  { id: "fc-003", name: "Facture Électricité", category: "Électricité", amount: 75000, paymentDate: new Date("2024-07-15"), frequency: "Mensuel" },
];

const categoryConfig: { [key in FixedCostCategory]: { icon: React.ElementType, color: string } } = {
  "Loyer": { icon: Building, color: "bg-orange-500/20 text-orange-700 border-orange-500/30" },
  "Salaires": { icon: Users, color: "bg-blue-500/20 text-blue-700 border-blue-500/30" },
  "Électricité": { icon: Zap, color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30" },
  "Maintenance": { icon: Wrench, color: "bg-gray-500/20 text-gray-700 border-gray-500/30" },
  "Autre": { icon: Home, color: "bg-purple-500/20 text-purple-700 border-purple-500/30" },
};

interface FixedCostsManagementProps {
  fixedCosts: FixedCost[];
  setFixedCosts: React.Dispatch<React.SetStateAction<FixedCost[]>>;
  onAddFixedCost: (cost: Omit<FixedCost, 'id'>) => void;
}

export default function FixedCostsManagement({ fixedCosts, setFixedCosts, onAddFixedCost }: FixedCostsManagementProps) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<FixedCost | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const category = formData.get("category") as FixedCostCategory;
    const amount = Number(formData.get("amount"));
    const paymentDateStr = formData.get("paymentDate") as string;
    const paymentDate = new Date(paymentDateStr);
    const frequency = formData.get("frequency") as FixedCost['frequency'];
    
    if (editingCost) {
        // Update logic - creates a new transaction but modifies the displayed cost
        const updatedCost = { id: editingCost.id, name, category, amount, paymentDate, frequency };
        onAddFixedCost({ name, category, amount, paymentDate, frequency }); // Creates a new transaction
        setFixedCosts(prev => prev.map(c => c.id === editingCost.id ? updatedCost : c));
        toast({
            title: "Charge modifiée",
            description: `La charge "${name}" a été mise à jour et une nouvelle transaction a été enregistrée.`,
        });
    } else {
        onAddFixedCost({ name, category, amount, paymentDate, frequency });
        toast({
          title: "Charge Ajoutée",
          description: `La charge "${name}" a été ajoutée et une transaction a été créée.`,
        });
    }

    setDialogOpen(false);
    setEditingCost(null);
  };
  
  const handleOpenDialog = (cost: FixedCost | null) => {
    setEditingCost(cost);
    setDialogOpen(true);
  };

  const handleDeleteCost = (costId: string) => {
    setFixedCosts(prev => prev.filter(cost => cost.id !== costId));
    toast({
      title: "Charge Supprimée",
      description: "La charge fixe a été supprimée de cette liste (la transaction reste).",
      variant: "destructive",
    });
  };
  
  const totalMonthlyCost = fixedCosts.reduce((acc, cost) => {
      if (cost.frequency === 'Mensuel') return acc + cost.amount;
      if (cost.frequency === 'Trimestriel') return acc + cost.amount / 3;
      if (cost.frequency === 'Annuel') return acc + cost.amount / 12;
      return acc;
  }, 0);


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coût Mensuel Estimé</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalMonthlyCost.toLocaleString('fr-FR')} FCFA</div>
                <p className="text-xs text-muted-foreground">Basé sur les charges récurrentes enregistrées</p>
            </CardContent>
        </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Liste des Charges Fixes</CardTitle>
              <CardDescription>
                Suivez les dépenses récurrentes comme les loyers, salaires, et factures.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) setEditingCost(null); setDialogOpen(isOpen); }}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Ajouter une charge
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleFormSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingCost ? "Modifier la charge" : "Ajouter une nouvelle charge"}</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations pour enregistrer un paiement. Une transaction de dépense sera créée.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom de la charge</Label>
                      <Input id="name" name="name" placeholder="Ex: Loyer Espace KHEOPS" required defaultValue={editingCost?.name}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Catégorie</Label>
                            <Select name="category" required defaultValue={editingCost?.category || "Loyer"}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                {Object.keys(categoryConfig).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Montant (FCFA)</Label>
                            <Input id="amount" name="amount" type="number" required defaultValue={editingCost?.amount}/>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentDate">Date de paiement</Label>
                          <Input id="paymentDate" name="paymentDate" type="date" required defaultValue={editingCost ? format(editingCost.paymentDate, 'yyyy-MM-dd') : ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="frequency">Fréquence</Label>
                            <Select name="frequency" required defaultValue={editingCost?.frequency || "Mensuel"}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Mensuel">Mensuel</SelectItem>
                                    <SelectItem value="Trimestriel">Trimestriel</SelectItem>
                                    <SelectItem value="Annuel">Annuel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">{editingCost ? "Enregistrer les modifications" : "Ajouter la charge"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Fréquence</TableHead>
                  <TableHead>Dernier Paiement</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fixedCosts.length > 0 ? (
                  fixedCosts.map((cost) => {
                    const catInfo = categoryConfig[cost.category];
                    return (
                    <TableRow key={cost.id}>
                      <TableCell className="font-medium">{cost.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={catInfo.color}>
                          <catInfo.icon className="mr-1.5 h-3.5 w-3.5" />
                          {cost.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{cost.frequency}</TableCell>
                      <TableCell>
                        {format(cost.paymentDate, "d MMM yyyy", { locale: fr })}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                          {cost.amount.toLocaleString('fr-FR')} FCFA
                      </TableCell>
                       <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDialog(cost)}>
                                    <Edit className="mr-2 h-4 w-4" /> Enregistrer un nouveau paiement
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteCost(cost.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                       </TableCell>
                    </TableRow>
                  )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucune charge fixe enregistrée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">
                L'ajout ou la modification d'une charge ici créera une nouvelle transaction dans la <span className="font-semibold">Gestion Financière</span>. La suppression ici n'enlève pas les transactions passées.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
