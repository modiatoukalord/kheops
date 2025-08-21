
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, CalendarIcon } from "lucide-react";
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

export const initialEvents = [
  {
    id: "evt-001",
    title: "Tournoi e-sport: La Fureur d'Anubis",
    startDate: new Date("2024-07-30T10:00:00"),
    endDate: new Date("2024-07-31T18:00:00"),
    category: "Compétition",
  },
  {
    id: "evt-002",
    title: "Conférence: L'Influence de l'Égypte",
    startDate: new Date("2024-08-15T15:00:00"),
    category: "Conférence",
  },
  {
    id: "evt-003",
    title: "Atelier d'écriture de Manga",
    startDate: new Date("2024-09-02T14:00:00"),
    category: "Atelier",
  },
    {
    id: "evt-004",
    title: "Lancement KHEOPS WEAR",
    startDate: new Date("2024-08-20T18:00:00"),
    category: "Lancement",
  },
];

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
};

interface EventManagementProps {
  events: AppEvent[];
  setEvents: React.Dispatch<React.SetStateAction<AppEvent[]>>;
}

export default function EventManagement({ events, setEvents }: EventManagementProps) {
  const [date, setDate] = useState<DateRange | undefined>();
  const { toast } = useToast();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const upcomingEvents = events
    .filter(event => (event.endDate || event.startDate) >= new Date())
    .sort((a,b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 5);
    
  const handleAddEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    
    if (date?.from && title) {
        const newEvent: AppEvent = {
            id: `evt-${Date.now()}`,
            title,
            startDate: date.from,
            endDate: date.to,
            category: formData.get("category") as string,
        };
        setEvents(prev => [newEvent, ...prev]);
        toast({
            title: "Événement Ajouté",
            description: `L'événement "${title}" a été ajouté.`,
        });
        setDialogOpen(false);
        setDate(undefined);
    } else {
        toast({
            title: "Erreur",
            description: "Veuillez remplir tous les champs obligatoires.",
            variant: "destructive"
        })
    }
  };
  
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
                <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Ajouter un événement
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleAddEvent}>
                            <DialogHeader>
                                <DialogTitle>Ajouter un nouvel événement</DialogTitle>
                                <DialogDescription>
                                    Remplissez les informations pour créer un nouvel événement.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Titre de l'événement</Label>
                                    <Input id="title" name="title" placeholder="Ex: Tournoi e-sport" required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Catégorie</Label>
                                    <Select name="category" required>
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
                                <Button type="submit">Ajouter l'événement</Button>
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
            <CardDescription>Les 5 prochains événements prévus.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => {
                    const formatEventDate = (event: AppEvent) => {
                        const startDate = format(event.startDate, "d MMM yyyy", { locale: fr });
                        if (event.endDate) {
                            const endDate = format(event.endDate, "d MMM yyyy", { locale: fr });
                            if (startDate === endDate) {
                                return `${startDate} à ${format(event.startDate, "HH:mm")}`;
                            }
                            return `Du ${startDate} au ${endDate}`;
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
                        <div className="flex gap-2 ml-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                      </div>
                    )
                })
              ) : (
                <p className="text-muted-foreground text-center">Aucun événement à venir.</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-4 justify-center">
             <Button variant="ghost" className="w-full">Voir tous les événements</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
