

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, GripVertical, DiscAlbum, Pencil, Minus, Plus, User, FileText, Server, Eye, Phone, Trash2, Edit, FileSignature, AlertCircle, BookOpen } from "lucide-react";
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
import { doc, updateDoc, deleteDoc, collection, onSnapshot, query, where } from "firebase/firestore";
import { servicesWithPrices, calculatePrice } from "@/lib/pricing";

export type Booking = {
  id: string;
  artistName: string; // Doubles as client name for culture bookings
  projectName: string; // Doubles as item title for culture bookings
  projectType: "Single" | "Mixtape" | "Album" | "Autre" | "Studio" | "Culture" | "Wear";
  date: Date; // For single, this is the date. For multi-track, could be start date or first date.
  timeSlot: string; // Same as above.
  service: string | "Achat" | "Emprunt/Achat" | "Achat Multiple";
  status: "Confirmé" | "En attente" | "Annulé" | "Payé" | "Expédiée";
  amount: number;
  phone?: string;
  tracks?: { name: string; date: Date; timeSlot: string }[];
}


const bookingStatusConfig = {
  "Confirmé": { variant: "default", icon: CheckCircle2, color: "text-green-500" },
  "En attente": { variant: "secondary", icon: Clock, color: "text-yellow-500" },
  "Annulé": { variant: "destructive", icon: XCircle, color: "text-red-500" },
  "Payé": { variant: "default", icon: CheckCircle2, color: "bg-green-500/80 text-white" },
  "Expédiée": { variant: "default", icon: CheckCircle2, color: "bg-blue-500/80 text-white" },
};


type BookingStatus = keyof typeof bookingStatusConfig;


const availableServices = Object.keys(servicesWithPrices);
const availableTimeSlots = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];
const projectTypes = ["Single", "Mixtape", "Album", "Autre"] as const;

interface BookingScheduleProps {
  bookings: Booking[];
  onAddBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  onUpdateBookingStatus: (bookingId: string, newStatus: Booking['status']) => void;
  onCreateContract: (booking: Booking) => void;
}

const trackSchema = z.object({
  name: z.string().min(1, { message: "Nom requis" }),
  date: z.date({ required_error: "Date requise" }),
  timeSlot: z.string({ required_error: "Créneau requis" }),
});

const bookingFormSchema = z.object({
  artistName: z.string().min(1, "Nom de l'artiste requis"),
  projectName: z.string().min(1, "Nom du projet requis"),
  service: z.string({ required_error: "Service requis" }),
  phone: z.string().optional(),
  tracks: z.array(trackSchema).min(1, 'Veuillez ajouter au moins une session.'),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;


export default function BookingSchedule({ bookings, onAddBooking, onUpdateBookingStatus, onCreateContract }: BookingScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isBookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const { toast } = useToast();
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      artistName: '',
      projectName: '',
      phone: '',
      service: '',
      tracks: [{ name: '', date: new Date(), timeSlot: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tracks",
  });
  
  const watchedTracks = form.watch("tracks");
  const watchedService = form.watch("service");
  const totalAmount = useMemo(() => {
    return calculatePrice(watchedService, watchedTracks?.length || 0);
  }, [watchedService, watchedTracks]);


  const handleBookingStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await onUpdateBookingStatus(bookingId, newStatus);
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
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) return;
    try {
        await deleteDoc(doc(db, "bookings", bookingId));
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
  
  const handleBookingSubmit = async (data: BookingFormValues) => {
    let projectType: Booking['projectType'] = 'Studio';
    if (data.tracks.length === 1) {
        projectType = 'Single';
    } else if (data.tracks.length > 1 && data.tracks.length <= 5) {
        projectType = 'Mixtape';
    } else if (data.tracks.length > 5) {
        projectType = 'Album';
    }

    const bookingData: Omit<Booking, 'id' | 'status'> = {
        artistName: data.artistName,
        projectName: data.projectName,
        projectType: projectType,
        phone: data.phone,
        service: data.service,
        tracks: data.tracks,
        date: data.tracks[0].date, // Use first track's date as main date
        timeSlot: data.tracks[0].timeSlot,
        amount: totalAmount,
    };

    if (editingBooking) {
      try {
        const bookingRef = doc(db, "bookings", editingBooking.id);
        await updateDoc(bookingRef, { ...bookingData });
        toast({
          title: "Réservation modifiée",
          description: `La réservation pour ${bookingData.artistName} a été mise à jour.`,
        });
      } catch (error) {
        console.error("Error updating booking: ", error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la réservation.",
          variant: "destructive"
        });
      }
    } else {
      onAddBooking(bookingData);
      toast({
          title: "Réservation ajoutée",
          description: `La réservation pour ${bookingData.artistName} a été ajoutée.`,
      });
    }

    setBookingDialogOpen(false);
    setEditingBooking(null);
    form.reset();
  };

  const openBookingDialog = (booking: Booking | null) => {
    setEditingBooking(booking);
    if (booking) {
      form.reset({
        artistName: booking.artistName,
        projectName: booking.projectName,
        phone: booking.phone,
        service: booking.service,
        tracks: booking.tracks || [{ name: '', date: new Date(), timeSlot: '' }],
      });
    } else {
      form.reset({
        artistName: '',
        projectName: '',
        phone: '',
        service: '',
        tracks: [{ name: '', date: new Date(), timeSlot: '' }],
      });
    }
    setBookingDialogOpen(true);
  };
  
  const studioBookings = useMemo(() => bookings.filter(b => b.projectType !== 'Culture' && b.projectType !== 'Wear'), [bookings]);

  const bookingsForSelectedDate = studioBookings.filter(booking => 
    selectedDate ? format(booking.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') : true
  ).sort((a,b) => a.timeSlot.localeCompare(b.timeSlot));

  const confirmedBookings = studioBookings.filter(b => b.status === "Confirmé").sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader className="flex flex-row justify-between items-start">
              <div>
                  <CardTitle>Calendrier de l'Agenda</CardTitle>
                  <CardDescription>Sélectionnez une date pour voir les réservations.</CardDescription>
              </div>
              <Dialog open={isBookingDialogOpen} onOpenChange={(isOpen) => {
                  setBookingDialogOpen(isOpen);
                  if (!isOpen) {
                      setEditingBooking(null);
                      form.reset();
                  }
              }}>
                  <DialogTrigger asChild>
                      <Button onClick={() => openBookingDialog(null)}>
                          <PlusCircle className="mr-2 h-4 w-4"/>
                          Ajouter une réservation
                      </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl">
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleBookingSubmit)} className="space-y-6">
                          <DialogHeader>
                              <DialogTitle>{editingBooking ? "Modifier la réservation" : "Ajouter une nouvelle réservation"}</DialogTitle>
                              <DialogDescription>
                                  {editingBooking ? "Mettez à jour les détails de la réservation." : "Remplissez les détails pour créer une nouvelle réservation de studio."}
                              </DialogDescription>
                          </DialogHeader>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                              <FormField control={form.control} name="artistName" render={({ field }) => (<FormItem><Label>Artiste</Label><FormControl><Input placeholder="Nom de l'artiste" {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="projectName" render={({ field }) => (<FormItem><Label>Projet</Label><FormControl><Input placeholder="Nom du projet" {...field} /></FormControl><FormMessage /></FormItem>)} />
                               <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><Label>Téléphone</Label><FormControl><Input placeholder="Numéro de téléphone" {...field} /></FormControl><FormMessage /></FormItem>)} />
                               <FormField control={form.control} name="service" render={({ field }) => (<FormItem><Label>Service</Label><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un service" /></SelectTrigger></FormControl><SelectContent>{availableServices.map(service => <SelectItem key={service} value={service}>{service} ({servicesWithPrices[service as keyof typeof servicesWithPrices].toLocaleString('fr-FR')} FCFA / session)</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                          </div>
                          
                          <Separator/>

                          <div className="space-y-4">
                             <div className="flex items-center justify-between">
                                  <h4 className="text-lg font-medium">Planification des Sessions</h4>
                                  <Button type="button" size="sm" onClick={() => append({ name: '', date: new Date(), timeSlot: '' })}><PlusCircle className="mr-2 h-4 w-4" />Ajouter une session</Button>
                             </div>
                             <div className="space-y-4 max-h-64 overflow-y-auto pr-4">
                              {fields.map((item, index) => (
                                  <div key={item.id} className="p-3 rounded-md border bg-card/50 flex items-start gap-4">
                                      <div className="flex-grow grid md:grid-cols-3 gap-4">
                                           <FormField control={form.control} name={`tracks.${index}.name`} render={({ field }) => (<FormItem><Label>Titre / Session</Label><FormControl><Input placeholder={`Titre #${index + 1}`} {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                                      {fields.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" className="mt-6 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => remove(index)}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                      )}
                                  </div>
                              ))}
                             </div>
                          </div>

                          <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center pt-4 border-t">
                            <div className="text-lg font-bold">
                                Total: {totalAmount.toLocaleString('fr-FR')} FCFA
                            </div>
                            <Button type="submit">{editingBooking ? "Enregistrer les modifications" : "Ajouter la réservation"}</Button>
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
                      booked: bookings.filter(b => b.status === 'Confirmé' || b.status === 'Payé').map(b => b.date),
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
                                  <Badge variant={statusInfo.variant} className={booking.status === 'Payé' || booking.status === 'Expédiée' ? statusInfo.color : ''}>
                                      <statusInfo.icon className={`mr-1.5 h-3 w-3 ${booking.status !== 'Payé' && booking.status !== 'Expédiée' ? statusInfo.color : ''}`} />
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
                                  <DropdownMenuItem onClick={() => openBookingDialog(booking)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Modifier
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
                       <TableCell className="text-right">
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
                                    <DropdownMenuItem onClick={() => onCreateContract(booking)}>
                                        <FileSignature className="mr-2 h-4 w-4" />
                                        Créer un contrat
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                       </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
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
                          <div><Label className="text-muted-foreground">{selectedBooking.projectType === 'Culture' ? 'Client' : 'Artiste'}</Label><p>{selectedBooking.artistName}</p></div>
                          <div><Label className="text-muted-foreground">{selectedBooking.projectType === 'Culture' ? 'Produit' : 'Projet'}</Label><p>{selectedBooking.projectName}</p></div>
                          <div><Label className="text-muted-foreground">Type</Label><p>{selectedBooking.projectType}</p></div>
                          <div><Label className="text-muted-foreground">Service</Label><p>{selectedBooking.service}</p></div>
                          {selectedBooking.phone && <div><Label className="text-muted-foreground">Téléphone</Label><p className="flex items-center gap-2"><Phone className="h-3 w-3" />{selectedBooking.phone}</p></div>}
                          <div><Label className="text-muted-foreground">Statut</Label><Badge variant={bookingStatusConfig[selectedBooking.status].variant}>{selectedBooking.status}</Badge></div>
                      </div>

                      <Separator className="my-2" />

                      {selectedBooking.tracks && selectedBooking.tracks.length > 0 ? (
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
                      ) : (
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                {selectedBooking.projectType === 'Culture' ? <BookOpen className="h-4 w-4" /> : <DiscAlbum className="h-4 w-4" />}
                                Détails de la demande
                            </h4>
                            <p className="text-sm text-muted-foreground">Demande pour le produit culturel "{selectedBooking.projectName}" par {selectedBooking.artistName}.</p>
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

  