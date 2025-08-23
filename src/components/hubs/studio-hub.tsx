
"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Headphones, DiscAlbum, MessageSquare, Send } from "lucide-react";
import Image from 'next/image';
import BookingChat from '@/components/hubs/booking-chat';
import { Booking } from '@/components/admin/booking-schedule';

const recentProjects = [
  {
    title: "Chroniques de l'Aube",
    artist: "KHEOPS Collective",
    coverUrl: "https://placehold.co/600x600.png",
    hint: "album cover"
  },
  {
    title: "Single 'Mirage'",
    artist: "L'Artiste Anonyme",
    coverUrl: "https://placehold.co/600x600.png",
    hint: "desert mirage"
  },
  {
    title: "Projet 'Nouvelle Vague'",
    artist: "Mc Solaar",
    coverUrl: "https://placehold.co/600x600.png",
    hint: "ocean wave"
  },
  {
    title: "Maquette 'Djadja 2'",
    artist: "Aya Nakamura",
    coverUrl: "https://placehold.co/600x600.png",
    hint: "pop music"
  },
];

const services = [
    { name: "Prise de voix", description: "Enregistrement vocal de haute qualité.", icon: Music },
    { name: "Mixage & Mastering", description: "Équilibrage et finalisation professionnelle.", icon: Headphones },
    { name: "Production complète", description: "De la composition à la piste finale.", icon: DiscAlbum },
];

interface StudioHubProps {
  onAddBooking: (booking: Omit<Booking, 'id' | 'status' | 'amount'>) => void;
}

export default function StudioHub({ onAddBooking }: StudioHubProps) {
  const [isChatOpen, setChatOpen] = useState(false);
    
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
        <h2 className="text-3xl font-semibold font-headline text-center mb-8">Projets Récents</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {recentProjects.map((project) => (
            <div key={project.title} className="group">
              <Card className="overflow-hidden border-border/50">
                <Image
                  src={project.coverUrl}
                  alt={`Pochette de ${project.title}`}
                  width={600}
                  height={600}
                  className="object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={project.hint}
                />
              </Card>
              <div className="mt-2 text-center">
                <p className="font-semibold text-foreground">{project.title}</p>
                <p className="text-sm text-muted-foreground">{project.artist}</p>
              </div>
            </div>
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

      <BookingChat isOpen={isChatOpen} onOpenChange={setChatOpen} onBookingSubmit={onAddBooking} />
    </div>
  );
}
