
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, DollarSign, Calendar as CalendarIcon, Book, Gamepad2, MicVocal, Phone, Clock, Puzzle, BookCopy, Trash2, Minus } from "lucide-react";
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
import { format, differenceInMinutes, formatDistanceStrict, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";


export type ClientActivity = {
  id: string;
  clientName: string;
  phone?: string;
  description: string;
  category: "Livre" | "Manga" | "Jeu de société" | "Session de jeu" | "Réservation Studio" | "Autre";
  amount: number;
  date: Date;
  duration?: string;
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
        const start = parse(data.startTime, 'HH:mm', new Date());
        const end = parse(data.endTime, 'HH:mm', new Date());
        return end > start;
    }
    return true;
}, {
    message: "L'heure de fin doit être après l'heure de début.",
    path: ["endTime"],
});


const activityFormSchema = z.object({
  clientName: z.string().min(1, "Nom du client requis"),
  phone: z.string().optional(),
  items: z.array(activityItemSchema).min(1, "Veuillez ajouter au moins une activité."),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;


export default function ActivityLog({ activities, setActivities }: ActivityLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      clientName: "",
      phone: "",
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
    (activity) =>
      activity.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const totalRevenue = activities.reduce((acc, activity) => acc + activity.amount, 0);

  const handleAddActivity = (data: ActivityFormValues) => {
    const { clientName, phone, items } = data;
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
        }
    });

    setActivities(prev => [...newActivities, ...prev]);
    toast({
      title: "Activités Ajoutées",
      description: `${items.length} activité(s) pour "${clientName}" ont été ajoutées.`,
    });
    setAddActivityDialogOpen(false);
    form.reset({
        clientName: "",
        phone: "",
        items: [{ description: "", category: "Autre", amount: 0, startTime: "", endTime: "" }],
    });
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
                    <DialogContent className="sm:max-w-3xl">
                       <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddActivity)}>
                            <DialogHeader>
                                <DialogTitle>Ajouter une nouvelle vente/activité</DialogTitle>
                                <DialogDescription>
                                    Remplissez les informations du client et ajoutez un ou plusieurs articles/services.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4 max-h-[80vh] overflow-y-auto pr-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="clientName" render={({ field }) => (<FormItem><Label>Nom du client</Label><FormControl><Input placeholder="Ex: Jean Dupont" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><Label>Téléphone</Label><FormControl><Input placeholder="Ex: +242 06 123 4567" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-3 border rounded-lg space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-primary">Article #{index + 1}</h4>
                                                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
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
                                        </div>
                                    ))}
                                    <Button type="button" size="sm" variant="outline" onClick={() => append({ description: "", category: "Autre", amount: 0, startTime: "", endTime: "" })}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un article
                                    </Button>
                                </div>

                                <Separator />
                                <div className="flex justify-end items-center gap-4 text-lg font-bold">
                                    <span>Total:</span>
                                    <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                            </div>
                            <DialogFooter className="pt-4 border-t">
                                <Button type="submit">Enregistrer la vente</Button>
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
                        <Badge variant="secondary" className={catInfo?.color || ''}>
                          {catInfo?.icon && <catInfo.icon className="mr-1.5 h-3.5 w-3.5" />}
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

    