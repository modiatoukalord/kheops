
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, GripVertical } from "lucide-react";
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
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";

export type Booking = {
  id: string;
  artistName: string;
  projectName: string;
  date: Date;
  timeSlot: string;
  service: string;
  status: "Confirmé" | "En attente" | "Annulé";
  amount: number;
}

const servicesWithPrices = {
  "Prise de voix": 30000,
  "Prise de voix + Mix": 50000,
  "Full-package": 75000,
  "Prise de voix + Mix + Mastering": 75000,
};

const calculatePrice = (service: string, timeSlot: string) => {
    const hourlyRate = servicesWithPrices[service as keyof typeof servicesWithPrices] || 0;
    const [start, end] = timeSlot.split(' - ').map(t => parseInt(t.split(':')[0], 10));
    const duration = end - start;
    return hourlyRate * duration;
};


export const initialBookings: Booking[] = [
  {
    id: "res-001",
    artistName: "KHEOPS Collective",
    projectName: "Chroniques de l'Aube",
    date: new Date("2024-07-31T09:00:00"),
    timeSlot: "09:00 - 11:00",
    service: "Prise de voix + Mix",
    status: "Confirmé",
    amount: 100000,
  },
  {
    id: "res-002",
    artistName: "L'Artiste Anonyme",
    projectName: "Single 'Mirage'",
    date: new Date("2024-08-02T14:00:00"),
    timeSlot: "14:00 - 16:00",
    service: "Prise de voix",
    status: "En attente",
    amount: 60000,
  },
  {
    id: "res-003",
    artistName: "Mc Solaar",
    projectName: "Projet 'Nouvelle Vague'",
    date: new Date("2024-08-05T16:00:00"),
    timeSlot: "16:00 - 18:00",
    service: "Full-package",
    status: "Confirmé",
    amount: 150000,
  },
    {
    id: "res-004",
    artistName: "Aya Nakamura",
    projectName: "Maquette 'Djadja 2'",
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

interface BookingScheduleProps {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  onAddBooking: (booking: Omit<Booking, 'id'>) => void;
}


export default function BookingSchedule({ bookings, setBookings, onAddBooking }: BookingScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isBookingDialogOpen, setBookingDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      artistName: '',
      projectName: '',
      timeSlot: '',
      service: '',
    },
  });

  const handleBookingStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  };
  
  const handleAddBookingSubmit = (data: any) => {
    const newBooking = {
      artistName: data.artistName,
      projectName: data.projectName,
      date: selectedDate!,
      timeSlot: data.timeSlot,
      service: data.service,
      status: "En attente" as BookingStatus,
      amount: calculatePrice(data.service, data.timeSlot),
    };
    onAddBooking(newBooking);
    toast({
        title: "Réservation ajoutée",
        description: `La réservation pour ${newBooking.artistName} a été ajoutée.`,
    });
    setBookingDialogOpen(false);
    form.reset();
  };
  
  const bookingsForSelectedDate = bookings.filter(booking => 
    selectedDate && booking.date.toDateString() === selectedDate.toDateString()
  ).sort((a,b) => a.timeSlot.localeCompare(b.timeSlot));

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
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
                    <DialogContent>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleAddBookingSubmit)}>
                            <DialogHeader>
                                <DialogTitle>Ajouter une nouvelle réservation</DialogTitle>
                                <DialogDescription>
                                    Remplissez les détails pour créer une nouvelle réservation de studio.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <FormField control={form.control} name="artistName" render={({ field }) => (<FormItem className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Artiste</Label><FormControl><Input placeholder="Nom de l'artiste" className="col-span-3" required {...field} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="projectName" render={({ field }) => (<FormItem className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Projet</Label><FormControl><Input placeholder="Nom du projet" className="col-span-3" required {...field} /></FormControl></FormItem>)} />
                                
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "col-span-3 justify-start text-left font-normal",
                                                    !selectedDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
                                                initialFocus
                                                locale={fr}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormField control={form.control} name="timeSlot" render={({ field }) => (<FormItem className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Créneau</Label><Select onValueChange={field.onChange} defaultValue={field.value} required><FormControl><SelectTrigger className="col-span-3"><SelectValue placeholder="Sélectionner un créneau" /></SelectTrigger></FormControl><SelectContent>{availableTimeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                                <FormField control={form.control} name="service" render={({ field }) => (<FormItem className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Service</Label><Select onValueChange={field.onChange} defaultValue={field.value} required><FormControl><SelectTrigger className="col-span-3"><SelectValue placeholder="Sélectionner un service" /></SelectTrigger></FormControl><SelectContent>{availableServices.map(service => <SelectItem key={service} value={service}>{service}</SelectItem>)}</SelectContent></Select></FormItem>)} />

                            </div>
                            <DialogFooter>
                                <Button type="submit">Ajouter la réservation</Button>
                            </DialogFooter>
                        </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="flex justify-center p-2 sm:p-6">
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
            </CardContent>
        </Card>
      </div>

      <div className="md:col-span-1">
        <Card>
            <CardHeader>
                <CardTitle>
                  Réservations pour le {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: fr }) : '...'}
                </CardTitle>
                <CardDescription>Détails des sessions prévues pour la journée sélectionnée.</CardDescription>
            </CardHeader>
            <CardContent>
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
                                <p className="text-sm text-muted-foreground">{booking.projectName}</p>
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
                                <DropdownMenuItem onClick={() => handleBookingStatusChange(booking.id, "Confirmé")}>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    Confirmer
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBookingStatusChange(booking.id, "Annulé")}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                    Annuler
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
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
