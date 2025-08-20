"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";


const initialBookings = [
  {
    id: "res-001",
    artistName: "KHEOPS Collective",
    projectName: "Chroniques de l'Aube",
    date: new Date("2024-07-31T09:00:00"),
    timeSlot: "09:00 - 11:00",
    service: "Prise de voix + Mix",
    status: "Confirmé" as "Confirmé" | "En attente" | "Annulé",
  },
  {
    id: "res-002",
    artistName: "L'Artiste Anonyme",
    projectName: "Single 'Mirage'",
    date: new Date("2024-08-02T14:00:00"),
    timeSlot: "14:00 - 16:00",
    service: "Prise de voix",
    status: "En attente" as "Confirmé" | "En attente" | "Annulé",
  },
  {
    id: "res-003",
    artistName: "Mc Solaar",
    projectName: "Projet 'Nouvelle Vague'",
    date: new Date("2024-08-05T16:00:00"),
    timeSlot: "16:00 - 18:00",
    service: "Full-package",
    status: "Confirmé" as "Confirmé" | "En attente" | "Annulé",
  },
    {
    id: "res-004",
    artistName: "Aya Nakamura",
    projectName: "Maquette 'Djadja 2'",
    date: new Date("2024-08-01T11:00:00"),
    timeSlot: "11:00 - 13:00",
    service: "Prise de voix",
    status: "Annulé" as "Confirmé" | "En attente" | "Annulé",
  },
  {
    id: "res-005",
    artistName: "Damso",
    projectName: "Album 'QALF 2'",
    date: new Date(),
    timeSlot: "18:00 - 20:00",
    service: "Prise de voix + Mix",
    status: "En attente" as "Confirmé" | "En attente" | "Annulé",
  },
];

const statusConfig = {
  "Confirmé": { variant: "default", icon: CheckCircle2, color: "text-green-500" },
  "En attente": { variant: "secondary", icon: Clock, color: "text-yellow-500" },
  "Annulé": { variant: "destructive", icon: XCircle, color: "text-red-500" },
};

type BookingStatus = keyof typeof statusConfig;

const availableServices = ["Prise de voix", "Prise de voix + Mix", "Full-package"];
const availableTimeSlots = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];

export default function BookingSchedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState(initialBookings);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm();


  const upcomingBookings = bookings
    .filter(booking => booking.date >= new Date())
    .sort((a,b) => a.date.getTime() - b.date.getTime());

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
  };
  
  const handleAddBooking = (data: any) => {
    const newBooking = {
      id: `res-${Date.now()}`,
      artistName: data.artistName,
      projectName: data.projectName,
      date: date!,
      timeSlot: data.timeSlot,
      service: data.service,
      status: "En attente" as BookingStatus,
    };
    setBookings(prev => [newBooking, ...prev]);
    toast({
        title: "Réservation ajoutée",
        description: `La réservation pour ${newBooking.artistName} a été ajoutée.`,
    });
    setDialogOpen(false);
  };


  return (
    <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-1">
             <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle>Calendrier</CardTitle>
                        <CardDescription>
                        Vue d'ensemble des réservations.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    locale={require("date-fns/locale/fr").fr}
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
      <div className="md:col-span-2">
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle>Réservations à venir</CardTitle>
                    <CardDescription>Gérez les réservations et leur statut.</CardDescription>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Ajouter une réservation
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <Form {...form}>
                         <form onSubmit={form.handleSubmit(handleAddBooking)}>
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
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "col-span-3 justify-start text-left font-normal",
                                                        !date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
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
          <CardContent>
             <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Artiste</TableHead>
                    <TableHead>Date & Heure</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {upcomingBookings.length > 0 ? upcomingBookings.map((booking) => {
                        const statusInfo = statusConfig[booking.status];
                        return (
                            <TableRow key={booking.id}>
                                <TableCell>
                                    <div className="font-medium">{booking.artistName}</div>
                                    <div className="text-sm text-muted-foreground">{booking.projectName}</div>
                                </TableCell>
                                <TableCell>
                                    {booking.date.toLocaleDateString("fr-FR", { day: '2-digit', month: 'short' })} {' - '}
                                    <span className="font-mono text-sm">{booking.timeSlot}</span>
                                </TableCell>
                                 <TableCell>{booking.service}</TableCell>
                                <TableCell>
                                <Badge variant={statusInfo.variant}>
                                    <statusInfo.icon className={`mr-2 h-3.5 w-3.5 ${statusInfo.color}`} />
                                    {booking.status}
                                </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "Confirmé")}>
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                        Confirmer
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(booking.id, "Annulé")}>
                                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                        Annuler
                                    </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    }) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">Aucune réservation à venir.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
             </div>
          </CardContent>
        </Card>
      </div>
    
    </div>
  );
}
