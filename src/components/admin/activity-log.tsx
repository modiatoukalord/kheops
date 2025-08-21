
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, DollarSign, Calendar as CalendarIcon, Book, Gamepad2, MicVocal, Phone, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export type ClientActivity = {
  id: string;
  clientName: string;
  phone?: string;
  description: string;
  category: "Achat de livre" | "Session de jeu" | "Réservation Studio" | "Autre";
  amount: number;
  date: Date;
  duration?: string;
};

interface ActivityLogProps {
  activities: ClientActivity[];
  setActivities: React.Dispatch<React.SetStateAction<ClientActivity[]>>;
}

const categoryConfig = {
    "Achat de livre": { icon: Book, color: "bg-blue-500/20 text-blue-700 border-blue-500/30" },
    "Session de jeu": { icon: Gamepad2, color: "bg-red-500/20 text-red-700 border-red-500/30" },
    "Réservation Studio": { icon: MicVocal, color: "bg-purple-500/20 text-purple-700 border-purple-500/30" },
    "Autre": { icon: DollarSign, color: "bg-gray-500/20 text-gray-700 border-gray-500/30" },
};

export default function ActivityLog({ activities, setActivities }: ActivityLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredActivities = activities.filter(
    (activity) =>
      activity.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalRevenue = activities.reduce((acc, activity) => acc + activity.amount, 0);

  const handleAddActivity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const clientName = formData.get("clientName") as string;
    const phone = formData.get("phone") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as ClientActivity['category'];
    const amount = parseFloat(formData.get("amount") as string) || 0;
    const duration = formData.get("duration") as string;


    const newActivity: ClientActivity = {
      id: `act-${Date.now()}`,
      clientName,
      phone,
      description,
      category,
      amount,
      date: new Date(),
      duration,
    };

    setActivities(prev => [newActivity, ...prev]);
    toast({
      title: "Activité Ajoutée",
      description: `L'activité pour "${clientName}" a été ajoutée avec succès.`,
    });
    setAddActivityDialogOpen(false);
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
                <Dialog open={isAddActivityDialogOpen} onOpenChange={setAddActivityDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Ajouter une activité
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <form onSubmit={handleAddActivity}>
                            <DialogHeader>
                                <DialogTitle>Ajouter une nouvelle activité</DialogTitle>
                                <DialogDescription>
                                    Remplissez les informations pour enregistrer une nouvelle activité client.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="clientName">Nom du client</Label>
                                        <Input id="clientName" name="clientName" placeholder="Ex: Jean Dupont" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Téléphone</Label>
                                        <Input id="phone" name="phone" placeholder="Ex: +242 06 123 4567" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input id="description" name="description" placeholder="Ex: Achat du livre 'Le Labyrinthe d'Osiris'" required />
                                </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Catégorie</Label>
                                        <Select name="category" required>
                                            <SelectTrigger><SelectValue placeholder="Sélectionner..."/></SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(categoryConfig).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">Montant (FCFA)</Label>
                                        <Input id="amount" name="amount" type="number" placeholder="Ex: 5000" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Durée (Optionnel)</Label>
                                    <Input id="duration" name="duration" placeholder="Ex: 2 heures" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Ajouter l'activité</Button>
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
                  <TableHead>Client</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
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
                      <TableCell>{activity.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={catInfo.color}>
                          <catInfo.icon className="mr-1.5 h-3.5 w-3.5" />
                          {activity.category}
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
                    </TableRow>
                  )})
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucune activité trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
