
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, GripVertical, DiscAlbum, Pencil, Minus, Plus, User, FileText, Server, Eye, Phone, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";


export type Booking = {
  id: string;
  artistName: string;
  projectName: string;
  projectType: "Single" | "Mixtape" | "Album" | "Autre";
  date: Date; // For single, this is the date. For multi-track, could be start date or first date.
  timeSlot: string; // Same as above.
  service: string;
  status: "Confirmé" | "En attente" | "Annulé";
  amount: number;
  phone?: string;
  tracks?: { name: string; date: Date; timeSlot: string }[];
}

const servicesWithPrices = {
  "Prise de voix": 30000,
  "Prise de voix + Mix": 50000,
  "Full-package": 75000,
  "Prise de voix + Mix + Mastering": 75000,
};

const calculatePrice = (service: string, timeSlots: string[]) => {
    const hourlyRate = servicesWithPrices[service as keyof typeof servicesWithPrices] || 0;
    const totalDuration = timeSlots.reduce((acc, slot) => {
        const [start, end] = slot.split(' - ').map(t => parseInt(t.split(':')[0], 10));
        const duration = end - start;
        return acc + duration;
    }, 0);
    return hourlyRate * totalDuration;
};


export const initialBookings: Booking[] = [
  {
    id: "res-001",
    artistName: "KHEOPS Collective",
    projectName: "Chroniques de l'Aube",
    projectType: "Album",
    date: new Date("2024-07-31T09:00:00"),
    timeSlot: "09:00 - 11:00",
    service: "Prise de voix + Mix",
    status: "Confirmé",
    amount: 100000,
    phone: "+242 06 000 0001",
    tracks: [
        { name: "Intro", date: new Date("2024-07-31T09:00:00"), timeSlot: "09:00 - 11:00" },
        { name: "Outro", date: new Date("2024-08-01T09:00:00"), timeSlot: "09:00 - 11:00" },
    ]
  },
  {
    id: "res-002",
    artistName: "L'Artiste Anonyme",
    projectName: "Single 'Mirage'",
    projectType: "Single",
    date: new Date("2024-08-02T14:00:00"),
    timeSlot: "14:00 - 16:00",
    service: "Prise de voix",
    status: "En attente",
    amount: 60000,
    phone: "+242 06 000 0002",
  },
  {
    id: "res-003",
    artistName: "Mc Solaar",
    projectName: "Projet 'Nouvelle Vague'",
    projectType: "Mixtape",
    date: new Date("2024-08-05T16:00:00"),
    timeSlot: "16:00 - 18:00",
    service: "Full-package",
    status: "Confirmé",
    amount: 150000,
    phone: "+242 06 000 0003",
  },
    {
    id: "res-004",
    artistName: "Aya Nakamura",
    projectName: "Maquette 'Djadja 2'",
    projectType: "Single",
    date: new Date("2024-08-01T11:00:00"),
    timeSlot: "11:00 - 13:00",
    service: "Prise de voix",
    status: "Annulé",
    amount: 60000,
  },
  {
    id: "res-005",
    artistName: "Damso",
    projectName: "Album 'QALF 2'",
    projectType: "Album",
    date: new Date(),
    timeSlot: "18:00 - 20:00",
    service: "Prise de voix + Mix",
    status: "En attente",
    amount: 100000,
  },
];


const bookingStatusConfig = {
  "Confirmé": { variant: "default", icon: CheckCircle2, color: "text-green-500" },
  "En attente": { variant: "secondary", icon: Clock, color: "text-yellow-500" },
  "Annulé": { variant: "destructive", icon: XCircle, color: "text-red-500" },
};


type BookingStatus = keyof typeof bookingStatusConfig;


const availableServices = ["Prise de voix", "Prise de voix + Mix", "Full-package"];
const availableTimeSlots = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];
const projectTypes = ["Single", "Mixtape", "Album", "Autre"] as const;

interface BookingScheduleProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  onAddBooking: (booking: Omit<Booking, 'id' | 'status' | 'amount'>) => void;
}

const trackSchema = z.object({
  name: z.string().min(1, { message: "Nom requis" }),
  date: z.date({ required_error: "Date requise" }),
  timeSlot: z.string({ required_error: "Créneau requis" }),
});

const bookingFormSchema = z.object({
  artistName: z.string().min(1, "Nom de l'artiste requis"),
  projectName: z.string().min(1, "Nom du projet requis"),
  projectType: z.enum(projectTypes, { required_error: "Type de projet requis" }),
  service: z.string({ required_error: "Service requis" }),
  phone: z.string().optional(),
  date: z.date().optional(),
  timeSlot: z.string().optional(),
  tracks: z.array(trackSchema).optional(),
}).superRefine((data, ctx) => {
    if (data.projectType === 'Single') {
        if (!data.date) {
            ctx.addIssue({ code: "custom", path: ['date'], message: 'Date requise pour un single.' });
        }
        if (!data.timeSlot) {
            ctx.addIssue({ code: "custom", path: ['timeSlot'], message: 'Créneau requis pour un single.' });
        }
    } else if (data.projectType === 'Mixtape' || data.projectType === 'Album') {
        if (!data.tracks || data.tracks.length === 0) {
             ctx.addIssue({ code: "custom", path: ['tracks'], message: 'Veuillez ajouter au moins un titre.' });
        }
    }
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;


export default function BookingSchedule({ bookings, setBookings, onAddBooking }: BookingScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isBookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const { toast } = useToast();
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      artistName: '',
      projectName: '',
      tracks: [{ name: '', date: new Date(), timeSlot: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tracks",
  });

  const projectType = form.watch("projectType");

  const handleBookingStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status: newStatus });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      toast({
          title: "Statut de la réservation mis à jour",
          description: `La réservation a été marquée comme "${newStatus}".`,
      });
    } catch (error) {
      console.error("Error updating booking status: ", error);
      toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut de la réservation.",
          variant: "destructive"
      });
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
        await deleteDoc(doc(db, "bookings", bookingId));
        setBookings(bookings.filter(b => b.id !== bookingId));
        toast({
            title: "Réservation Supprimée",
            description: "La réservation a été supprimée avec succès.",
            variant: "destructive"
        });
    } catch (error) {
        console.error("Error deleting booking: ", error);
        toast({
            title: "Erreur",
            description: "Impossible de supprimer la réservation.",
            variant: "destructive"
        });
    }
  };
  
  const handleAddBookingSubmit = (data: BookingFormValues) => {
    let newBooking: Omit<Booking, 'id' | 'status' | 'amount'>;
    
    if (data.projectType === 'Single' && data.date && data.timeSlot) {
        newBooking = {
            artistName: data.artistName,
            projectName: data.projectName,
            projectType: data.projectType,
            phone: data.phone,
            date: data.date,
            timeSlot: data.timeSlot,
            service: data.service,
            tracks: [{ name: data.projectName, date: data.date, timeSlot: data.timeSlot }],
        };
    } else if ((data.projectType === 'Mixtape' || data.projectType === 'Album') && data.tracks) {
         newBooking = {
            artistName: data.artistName,
            projectName: data.projectName,
            projectType: data.projectType,
            phone: data.phone,
            date: data.tracks[0].date, // Use first track's date as main date
            timeSlot: data.tracks[0].timeSlot,
            service: data.service,
            tracks: data.tracks,
        };
    } else {
        // Handle 'Autre' or invalid states
        toast({ title: "Erreur de formulaire", description: "Veuillez vérifier les informations.", variant: "destructive" });
        return;
    }

    onAddBooking(newBooking);
    toast({
        title: "Réservation ajoutée",
        description: `La réservation pour ${newBooking.artistName} a été ajoutée.`,
    });
    setBookingDialogOpen(false);
    form.reset();
  };
  
  const bookingsForSelectedDate = bookings.filter(booking => 
    selectedDate ? booking.date.toDateString() === selectedDate.toDateString() : true
  ).sort((a,b) => a.timeSlot.localeCompare(b.timeSlot));

  const confirmedBookings = bookings.filter(b => b.status === "Confirmé").sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader className="flex flex-row justify-between items-start">
              <div>
                  <CardTitle>Calendrier de l'Agenda</CardTitle>
                  <CardDescription>Sélectionnez une date pour voir les réservations.</CardDescription>
              </div>
              <Dialog open={isBookingDialogOpen} onOpenChange={setBookingDialogOpen}>
                  <DialogTrigger asChild>
                      <Button>
                          <PlusCircle className="mr-2 h-4 w-4"/>
                          Ajouter une réservation
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddBookingSubmit)} className="space-y-6">
                          <DialogHeader>
                              <DialogTitle>Ajouter une nouvelle réservation</DialogTitle>
                              <DialogDescription>
                                  Remplissez les détails pour créer une nouvelle réservation de studio.
                              </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                              <FormField control={form.control} name="artistName" render={({ field }) => (<FormItem><Label>Artiste</Label><FormControl><Input placeholder="Nom de l'artiste" {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="projectName" render={({ field }) => (<FormItem><Label>Projet</Label><FormControl><Input placeholder="Nom du projet" {...field} /></FormControl><FormMessage /></FormItem>)} />
                               <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><Label>Téléphone</Label><FormControl><Input placeholder="Numéro de téléphone" {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="projectType" render={({ field }) => (
                                  <FormItem>
                                  <Label>Type de Projet</Label>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un type" /></SelectTrigger></FormControl>
                                      <SelectContent>
                                        {projectTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                                  </FormItem>
                              )} />
                               <FormField control={form.control} name="service" render={({ field }) => (<FormItem><Label>Service</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un service" /></SelectTrigger></FormControl><SelectContent>{availableServices.map(service => <SelectItem key={service} value={service}>{service}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                          </div>
                          
                          <Separator/>

                          {projectType === 'Single' && (
                              <div className="grid md:grid-cols-2 gap-4">
                                  <FormField control={form.control} name="date" render={({ field }) => (
                                      <FormItem className="flex flex-col">
                                          <Label>Date</Label>
                                          <Popover>
                                              <PopoverTrigger asChild>
                                                  <FormControl>
                                                      <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                          {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                      </Button>
                                                  </FormControl>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-auto p-0" align="start">
                                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus locale={fr} />
                                              </PopoverContent>
                                          </Popover>
                                          <FormMessage />
                                      </FormItem>
                                  )}/>
                                   <FormField control={form.control} name="timeSlot" render={({ field }) => (
                                      <FormItem>
                                          <Label>Créneau</Label>
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un créneau" /></SelectTrigger></FormControl>
                                              <SelectContent>{availableTimeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}</SelectContent>
                                          </Select>
                                          <FormMessage />
                                      </FormItem>
                                  )}/>
                              </div>
                          )}
                          
                          {(projectType === 'Mixtape' || projectType === 'Album') && (
                              <div className="space-y-4">
                                 <div className="flex items-center justify-between">
                                      <h4 className="text-lg font-medium">Planification des Titres</h4>
                                      <Button type="button" size="sm" onClick={() => append({ name: '', date: new Date(), timeSlot: '' })}><PlusCircle className="mr-2 h-4 w-4" />Ajouter un titre</Button>
                                 </div>
                                 <div className="space-y-4 max-h-64 overflow-y-auto pr-4">
                                  {fields.map((item, index) => (
                                      <div key={item.id} className="p-3 rounded-md border bg-card/50 flex items-start gap-4">
                                          <div className="flex-grow grid md:grid-cols-3 gap-4">
                                               <FormField control={form.control} name={`tracks.${index}.name`} render={({ field }) => (<FormItem><Label>Titre</Label><FormControl><Input placeholder={`Titre #${index + 1}`} {...field} /></FormControl><FormMessage /></FormItem>)} />
                                              <FormField control={form.control} name={`tracks.${index}.date`} render={({ field }) => (
                                                  <FormItem className="flex flex-col">
                                                      <Label>Date</Label>
                                                      <Popover>
                                                          <PopoverTrigger asChild>
                                                              <FormControl>
                                                                  <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                                      {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                  </Button>
                                                              </FormControl>
                                                          </PopoverTrigger>
                                                          <PopoverContent className="w-auto p-0" align="start">
                                                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus locale={fr} />
                                                          </PopoverContent>
                                                      </Popover>
                                                      <FormMessage />
                                                  </FormItem>
                                              )}/>
                                              <FormField control={form.control} name={`tracks.${index}.timeSlot`} render={({ field }) => (
                                                  <FormItem>
                                                      <Label>Créneau</Label>
                                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                          <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner..." /></SelectTrigger></FormControl>
                                                          <SelectContent>{availableTimeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}</SelectContent>
                                                      </Select>
                                                      <FormMessage />
                                                  </FormItem>
                                              )}/>
                                          </div>
                                          <Button type="button" variant="ghost" size="icon" className="mt-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(index)}>
                                              <Minus className="h-4 w-4" />
                                          </Button>
                                      </div>
                                  ))}
                                 </div>
                              </div>
                          )}


                          <DialogFooter>
                              <Button type="submit">Ajouter la réservation</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                  </DialogContent>
              </Dialog>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  locale={fr}
                  modifiers={{
                      booked: bookings.filter(b => b.status === 'Confirmé').map(b => b.date),
                      pending: bookings.filter(b => b.status === 'En attente').map(b => b.date),
                  }}
                  modifiersStyles={{
                      booked: {
                          color: 'hsl(var(--primary-foreground))',
                          backgroundColor: 'hsl(var(--primary))',
                      },
                      pending: {
                          borderColor: 'hsl(var(--primary))',
                      }
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Réservations pour le {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: fr }) : '...'}
                </h3>
                {bookingsForSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {bookingsForSelectedDate.map((booking) => {
                      const statusInfo = bookingStatusConfig[booking.status];
                      return (
                          <div key={booking.id} className="flex items-center gap-4 p-3 rounded-lg bg-card-foreground/5">
                             <div className="font-mono text-sm text-center">
                               <p className="font-semibold">{booking.timeSlot.split(' - ')[0]}</p>
                               <GripVertical className="h-4 w-4 mx-auto text-muted-foreground/50"/>
                               <p>{booking.timeSlot.split(' - ')[1]}</p>
                             </div>
                             <div className="flex-grow">
                                  <p className="font-semibold">{booking.artistName}</p>
                                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                                     <DiscAlbum className="w-3 h-3"/> {booking.projectName}
                                  </p>
                                  <Badge variant={statusInfo.variant} className="mt-1">
                                      <statusInfo.icon className={`mr-1.5 h-3 w-3 ${statusInfo.color}`} />
                                      {booking.status}
                                  </Badge>
                             </div>
                              <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                   <DropdownMenuItem onClick={() => { setSelectedBooking(booking); setDetailsDialogOpen(true); }}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Voir les détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleBookingStatusChange(booking.id, "Confirmé")}>
                                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                      Confirmer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleBookingStatusChange(booking.id, "Annulé")}>
                                      <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                      Annuler
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteBooking(booking.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                  </DropdownMenuContent>
                              </DropdownMenu>
                          </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-10">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50"/>
                      <p>Aucune réservation pour cette date.</p>
                  </div>
                )}
              </div>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Toutes les réservations confirmées</CardTitle>
          <CardDescription>Liste complète de toutes les sessions de studio confirmées.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artiste</TableHead>
                  <TableHead>Projet</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {confirmedBookings.length > 0 ? (
                  confirmedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.artistName}</TableCell>
                      <TableCell>{booking.projectName}</TableCell>
                      <TableCell>{format(booking.date, "d MMM yyyy", { locale: fr })} à {booking.timeSlot}</TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell className="text-right font-semibold">{booking.amount.toLocaleString('fr-FR')} FCFA</TableCell>
                       <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedBooking(booking); setDetailsDialogOpen(true); }}>
                              <Eye className="h-4 w-4" />
                          </Button>
                       </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Aucune réservation confirmée pour le moment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

       <Dialog open={isDetailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle>Détails de la Réservation</DialogTitle>
                  <DialogDescription>
                      ID: {selectedBooking?.id}
                  </DialogDescription>
              </DialogHeader>
              {selectedBooking && (
                  <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div><Label className="text-muted-foreground">Artiste</Label><p>{selectedBooking.artistName}</p></div>
                          <div><Label className="text-muted-foreground">Projet</Label><p>{selectedBooking.projectName}</p></div>
                          <div><Label className="text-muted-foreground">Type</Label><p>{selectedBooking.projectType}</p></div>
                          <div><Label className="text-muted-foreground">Service</Label><p>{selectedBooking.service}</p></div>
                          {selectedBooking.phone && <div><Label className="text-muted-foreground">Téléphone</Label><p className="flex items-center gap-2"><Phone className="h-3 w-3" />{selectedBooking.phone}</p></div>}
                          <div><Label className="text-muted-foreground">Montant</Label><p className="font-semibold">{selectedBooking.amount.toLocaleString('fr-FR')} FCFA</p></div>
                          <div><Label className="text-muted-foreground">Statut</Label><Badge variant={bookingStatusConfig[selectedBooking.status].variant}>{selectedBooking.status}</Badge></div>
                      </div>

                      <Separator className="my-2" />

                      {selectedBooking.tracks && selectedBooking.tracks.length > 0 && (
                          <div>
                              <h4 className="font-semibold mb-2">Sessions d'enregistrement</h4>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {selectedBooking.tracks.map((track, index) => (
                                      <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                          <div>
                                              <p className="font-medium">{track.name}</p>
                                              <p className="text-sm text-muted-foreground">
                                                  {format(track.date, "d MMM yyyy", { locale: fr })} - {track.timeSlot}
                                              </p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}
              <DialogFooter>
                  <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>Fermer</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

    </div>
  );
}

    