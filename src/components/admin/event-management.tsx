
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, CalendarIcon, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";


export type AppEvent = {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  category: string;
};


const categoryColors: { [key: string]: string } = {
  Compétition: "bg-red-500/80 text-white",
  Conférence: "bg-blue-500/80 text-white",
  Atelier: "bg-green-500/80 text-white",
  Lancement: "bg-purple-500/80 text-white",
  Autre: "bg-gray-500/80 text-white",
};

interface EventManagementProps {
  events: AppEvent[];
  onAddEvent: (event: Omit<AppEvent, 'id'>) => void;
  onUpdateEvent: (id: string, event: Partial<Omit<AppEvent, 'id'>>) => void;
  onDeleteEvent: (id: string) => void;
}

export default function EventManagement({ events, onAddEvent, onUpdateEvent, onDeleteEvent }: EventManagementProps) {
  const [date, setDate] = useState<DateRange | undefined>();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AppEvent | null>(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const sortedUpcomingEvents = events
    .filter(event => (event.endDate || event.startDate) >= new Date())
    .sort((a,b) => a.startDate.getTime() - b.startDate.getTime());

  const upcomingEvents = showAllEvents ? sortedUpcomingEvents : sortedUpcomingEvents.slice(0, 5);
    
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    
    if (date?.from && title && category) {
        const eventData: Omit<AppEvent, 'id'> = {
            title,
            startDate: date.from,
            endDate: date.to,
            category,
        };

        if (editingEvent) {
            onUpdateEvent(editingEvent.id, eventData);
            toast({
                title: "Événement Modifié",
                description: `L'événement "${title}" a été mis à jour.`,
            });
        } else {
            onAddEvent(eventData);
            toast({
                title: "Événement Ajouté",
                description: `L'événement "${title}" a été ajouté.`,
            });
        }

        setDialogOpen(false);
        setEditingEvent(null);
        setDate(undefined);
    } else {
        toast({
            title: "Erreur",
            description: "Veuillez remplir tous les champs obligatoires.",
            variant: "destructive"
        })
    }
  };

  const handleOpenDialog = (event: AppEvent | null) => {
    setEditingEvent(event);
    if (event) {
        setDate({ from: event.startDate, to: event.endDate });
    } else {
        setDate(undefined);
    }
    setDialogOpen(true);
  };
  
  const handleDelete = (event: AppEvent) => {
      if(window.confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`)) {
          onDeleteEvent(event.id);
          toast({
              title: "Événement Supprimé",
              description: `L'événement a été supprimé.`,
              variant: "destructive"
          })
      }
  }
  
  const getEventDatesForCalendar = () => {
    return events.flatMap(e => {
        if (e.endDate) {
            const dates = [];
            let currentDate = new Date(e.startDate);
            while(currentDate <= e.endDate) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return dates;
        }
        return e.startDate;
    });
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle>Calendrier des Événements</CardTitle>
                    <CardDescription>
                    Planifiez et visualisez tous les événements liés à la structure.
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) { setEditingEvent(null); setDate(undefined); } setDialogOpen(isOpen); }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog(null)}>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Ajouter un événement
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleFormSubmit}>
                            <DialogHeader>
                                <DialogTitle>{editingEvent ? "Modifier l'événement" : "Ajouter un nouvel événement"}</DialogTitle>
                                <DialogDescription>
                                    Remplissez les informations pour créer ou modifier un événement.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Titre de l'événement</Label>
                                    <Input id="title" name="title" placeholder="Ex: Tournoi e-sport" required defaultValue={editingEvent?.title}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Catégorie</Label>
                                    <Select name="category" required defaultValue={editingEvent?.category}>
                                        <SelectTrigger><SelectValue placeholder="Sélectionner une catégorie"/></SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(categoryColors).map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                     <Label>Date de l'événement</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date?.from ? (
                                            date.to ? (
                                                <>
                                                {format(date.from, "d LLL, y", { locale: fr })} -{" "}
                                                {format(date.to, "d LLL, y", { locale: fr })}
                                                </>
                                            ) : (
                                                format(date.from, "d LLL, y", { locale: fr })
                                            )
                                            ) : (
                                            <span>Choisir une ou plusieurs dates</span>
                                            )}
                                        </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={date?.from}
                                            selected={date}
                                            onSelect={setDate}
                                            numberOfMonths={2}
                                            locale={fr}
                                        />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">{editingEvent ? "Enregistrer" : "Ajouter l'événement"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
          <CardContent className="flex justify-center p-2 sm:p-6">
            <Calendar
              mode="multiple"
              selected={getEventDatesForCalendar()}
              className="rounded-md border"
              locale={fr}
              numberOfMonths={2}
              modifiers={{
                event: getEventDatesForCalendar(),
              }}
              modifiersStyles={{
                event: {
                  color: 'hsl(var(--primary-foreground))',
                  backgroundColor: 'hsl(var(--primary))',
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Événements à venir</CardTitle>
            <CardDescription>Les prochains événements prévus.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length === 0 && (
                <div className="flex items-center justify-center h-24 gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Chargement...</span>
                </div>
              )}
              {events.length > 0 && upcomingEvents.length === 0 && (
                 <p className="text-muted-foreground text-center py-10">Aucun événement à venir.</p>
              )}
              {upcomingEvents.length > 0 && 
                upcomingEvents.map((event) => {
                    const formatEventDate = (event: AppEvent) => {
                        const startDate = format(event.startDate, "d MMM yyyy", { locale: fr });
                        if (event.endDate) {
                            const endDate = format(event.endDate, "d MMM yyyy", { locale: fr });
                            if (startDate === endDate) {
                                return `${startDate} à ${format(event.startDate, "HH:mm")}`;
                            }
                            return `Du ${format(event.startDate, "d MMM")} au ${endDate}`;
                        }
                        return `${startDate} à ${format(event.startDate, "HH:mm")}`;
                    };

                    return (
                      <div key={event.id} className="flex items-start justify-between p-3 rounded-lg bg-card/50">
                        <div className="flex-grow">
                          <p className="font-semibold">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatEventDate(event)}
                          </p>
                          <Badge className={`${categoryColors[event.category]} mt-1 border-0`}>{event.category}</Badge>
                        </div>
                        <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(event)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground" onClick={() => handleDelete(event)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </div>
                    )
                })
              }
            </div>
          </CardContent>
          {sortedUpcomingEvents.length > 5 && (
            <CardFooter className="pt-4 justify-center">
              <Button variant="ghost" className="w-full" onClick={() => setShowAllEvents(!showAllEvents)}>
                {showAllEvents ? "Voir moins" : "Voir tous les événements"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

    