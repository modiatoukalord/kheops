
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Headphones, DiscAlbum, MessageSquare, Send, CalendarDays, Newspaper, ArrowRight } from "lucide-react";
import Image from 'next/image';
import BookingChat from '@/components/hubs/booking-chat';
import { Booking } from '@/components/admin/booking-schedule';
import type { Content } from '@/components/admin/content-management';
import type { AppEvent } from '@/components/admin/event-management';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const services = [
    { name: "Prise de voix", description: "Enregistrement vocal de haute qualité.", icon: Music },
    { name: "Mixage & Mastering", description: "Équilibrage et finalisation professionnelle.", icon: Headphones },
    { name: "Production complète", description: "De la composition à la piste finale.", icon: DiscAlbum },
];

interface StudioHubProps {
  bookings: Booking[];
  onAddBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  content: Content[];
  events: AppEvent[];
}

export default function StudioHub({ bookings, onAddBooking, content, events }: StudioHubProps) {
  const [isChatOpen, setChatOpen] = useState(false);

  const studioNews = useMemo(() => {
    const publishedContent = content
      .filter(c => c.status === "Publié" && c.type === 'Projet Studio')
      .map(c => ({
        ...c,
        date: new Date(c.lastUpdated),
        itemType: 'content' as const
      }));

    const upcomingEvents = events
      .filter(event => (event.endDate || event.startDate) >= new Date())
      .map(e => ({
        ...e,
        date: e.startDate,
        itemType: 'event' as const
      }));

    return [...publishedContent, ...upcomingEvents].sort((a, b) => b.date.getTime() - a.date.getTime());

  }, [content, events]);
    
  return (
    <div className="space-y-16">
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-primary font-headline tracking-wider">KHEOPS STUDIO</h1>
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Donnez vie à vos projets musicaux dans un environnement professionnel avec un équipement de pointe.</p>
      </header>

      <section>
          <h2 className="text-3xl font-semibold font-headline text-center mb-8">Nos Prestations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {services.map((service) => (
                  <Card key={service.name} className="text-center bg-card border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                      <CardHeader className="items-center">
                          <div className="p-4 bg-primary/10 rounded-full text-primary">
                            <service.icon className="w-8 h-8" />
                          </div>
                      </CardHeader>
                      <CardContent>
                          <CardTitle className="text-xl mb-2">{service.name}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                      </CardContent>
                  </Card>
              ))}
          </div>
      </section>
      
      <section>
        <div className="flex items-center gap-4 mb-6 justify-center">
          <Newspaper className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-semibold font-headline">Actualités du Studio</h2>
        </div>
        <div className="space-y-6 max-w-3xl mx-auto">
            {studioNews.map((item) => (
                item.itemType === 'event' ? (
                <Card key={`event-${item.id}`} className="bg-card border-border/50 flex flex-col md:flex-row items-center p-4 gap-4 transition-all duration-300 hover:border-accent">
                    <div className="flex-shrink-0 text-center md:text-left">
                        <p className="text-lg font-bold text-primary">{format(item.date, "d MMM", { locale: fr }).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">{format(item.date, "yyyy")}</p>
                    </div>
                    <div className="border-l border-border/50 h-16 hidden md:block mx-4"></div>
                    <div className="flex-grow text-center md:text-left">
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                        <p className="text-muted-foreground">Événement à venir : {item.category}</p>
                    </div>
                    <Button className="flex-shrink-0 bg-accent text-accent-foreground hover:bg-accent/80">
                        S'inscrire
                    </Button>
                </Card>
                ) : (
                <Card key={`content-${item.id}`} className="bg-card border-border/50 flex flex-col md:flex-row gap-6 p-4 overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                    <div className="md:w-1/3 aspect-video md:aspect-square overflow-hidden rounded-lg flex-shrink-0">
                         <Image 
                            src={(item.imageUrls && item.imageUrls[0]) || `https://picsum.photos/seed/studio${item.id}/400/400`}
                            alt={`Image pour ${item.title}`}
                            width={400}
                            height={400}
                            data-ai-hint={item.title.toLowerCase().split(' ').slice(0,2).join(' ')}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                        />
                    </div>
                    <div className="flex flex-col flex-grow">
                        <CardTitle className="text-2xl font-semibold text-primary-foreground mb-2">{item.title}</CardTitle>
                         <CardDescription className="text-sm text-muted-foreground mb-2">Par {item.author} - {new Date(item.lastUpdated).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long' })}</CardDescription>
                        <p className="text-muted-foreground text-sm flex-grow line-clamp-4">{item.summary || `Découvrez notre dernier projet "${item.title}".`}</p>
                        <Button variant="outline" className="w-full md:w-fit mt-4 self-start border-primary/50 text-primary hover:bg-primary/10">
                            Lire la suite <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </Card>
                )
            ))}
        </div>
      </section>
      
      <section id="booking" className="max-w-3xl mx-auto">
         <h2 className="text-3xl font-semibold font-headline text-center mb-8">Réserver une Session</h2>
         <Card className="bg-card border-border/50">
             <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-12 h-12 text-primary" />
                        </div>
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <h3 className="text-2xl font-bold">Prêt à créer ?</h3>
                        <p className="text-muted-foreground">Discutons de votre projet. Cliquez sur le bouton pour démarrer une conversation avec notre assistant de réservation et planifier votre session en quelques minutes.</p>
                    </div>
                    <Button size="lg" className="flex-shrink-0 font-bold" onClick={() => setChatOpen(true)}>
                        Démarrer la Réservation
                        <Send className="ml-2 w-4 h-4"/>
                    </Button>
                </div>
             </CardContent>
         </Card>
      </section>

      <BookingChat 
        isOpen={isChatOpen} 
        onOpenChange={setChatOpen} 
        onBookingSubmit={onAddBooking}
        bookings={bookings}
       />
    </div>
  );
}
