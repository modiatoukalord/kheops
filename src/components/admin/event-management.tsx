"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const initialEvents = [
  {
    id: "evt-001",
    title: "Tournoi e-sport: La Fureur d'Anubis",
    date: new Date("2024-07-30T10:00:00"),
    category: "Compétition",
  },
  {
    id: "evt-002",
    title: "Conférence: L'Influence de l'Égypte",
    date: new Date("2024-08-15T15:00:00"),
    category: "Conférence",
  },
  {
    id: "evt-003",
    title: "Atelier d'écriture de Manga",
    date: new Date("2024-09-02T14:00:00"),
    category: "Atelier",
  },
    {
    id: "evt-004",
    title: "Lancement KHEOPS WEAR",
    date: new Date("2024-08-20T18:00:00"),
    category: "Lancement",
  },
];

const categoryColors: { [key: string]: string } = {
  Compétition: "bg-red-500/80 text-white",
  Conférence: "bg-blue-500/80 text-white",
  Atelier: "bg-green-500/80 text-white",
  Lancement: "bg-purple-500/80 text-white",
};


export default function EventManagement() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState(initialEvents);
  
  const eventsForSelectedDate = date
    ? events.filter(
        (event) => event.date.toDateString() === date.toDateString()
      )
    : [];
    
  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a,b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);


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
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Ajouter un événement
                </Button>
            </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              locale={require("date-fns/locale/fr").fr}
              modifiers={{
                event: events.map(e => e.date),
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
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start justify-between p-3 rounded-lg bg-card/50">
                    <div className="flex-grow">
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.date.toLocaleDateString("fr-FR", {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })} - {event.date.toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
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
                ))
              ) : (
                <p className="text-muted-foreground text-center">Aucun événement à venir.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
