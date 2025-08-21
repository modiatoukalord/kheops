
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CalendarDays, BookCopy, FileText, Film, Puzzle } from "lucide-react";
import React from "react";
import type { Content } from "@/components/admin/content-management";
import type { AppEvent } from "@/components/admin/event-management";

type CulturalContent = Pick<Content, 'title' | 'type'> & { description: string };

const contentDescriptions: { [key: string]: string } = {
  "Le Labyrinthe d'Osiris": "Plongez dans un thriller mystique au cœur de l'Égypte ancienne.",
  "Pharaoh's Legacy Vol. 1": "Une aventure épique où des lycéens réveillent un pouvoir ancestral.",
  "Les Chroniques de Thot": "Découvrez les secrets de la sagesse et de la magie égyptienne.",
  "L'art du Hiéroglyphe": "Une analyse approfondie de l'écriture sacrée des pharaons.",
};


const categoryIcons: { [key in Content['type']]: React.ElementType } = {
    Livre: BookOpen,
    Manga: BookCopy,
    Article: FileText,
    Film: Film,
    "Jeu de société": Puzzle,
};


interface CultureHubProps {
    content: Content[];
    events: AppEvent[];
}


export default function CultureHub({ content, events }: CultureHubProps) {
  const { toast } = useToast();

  const culturalContent: CulturalContent[] = content
    .filter(c => c.status === "Publié")
    .map(c => ({
        title: c.title,
        type: c.type,
        description: contentDescriptions[c.title] || "Description à venir."
    }));
    
  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a,b) => a.date.getTime() - b.date.getTime());


  const handleMembership = () => {
    toast({
      title: "Adhésion Bientôt Disponible",
      description: "Revenez bientôt pour rejoindre la communauté KHEOPS !",
    });
  };

  const handleRegistration = (eventTitle: string) => {
    toast({
      title: "Inscription Reçue",
      description: `Votre inscription pour "${eventTitle}" a bien été prise en compte.`,
    });
  };
  
  const handleDiscover = (contentTitle: string) => {
    toast({
      title: "Contenu à venir",
      description: `Le contenu pour "${contentTitle}" sera bientôt disponible.`,
    });
  };

  return (
    <div className="space-y-12">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary font-headline tracking-wider">KHEOPS CULTURE HUB</h1>
        <p className="text-muted-foreground text-lg">Votre portail vers un univers de connaissances et de divertissement.</p>
        <Button size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground font-bold" onClick={handleMembership}>
          Devenir Membre
        </Button>
      </header>

      <section>
        <div className="flex items-center gap-4 mb-6">
          <BookOpen className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-semibold font-headline">Catalogue de Contenus</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {culturalContent.map((item) => {
            const Icon = categoryIcons[item.type];
            return (
                <Card key={item.title} className="bg-card border-border/50 flex flex-col justify-between overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                <CardHeader className="items-center justify-center flex-grow p-6">
                    <div className="p-5 rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      <Icon className="w-16 h-16" />
                    </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-center">
                    <Badge variant="secondary" className="text-accent-foreground bg-accent/20 border-accent/50">{item.type}</Badge>
                    <CardTitle className="text-lg font-semibold text-primary-foreground">{item.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">{item.description}</CardDescription>
                    <Button variant="outline" className="w-full mt-2 border-primary/50 text-primary hover:bg-primary/10" onClick={() => handleDiscover(item.title)}>
                    Découvrir
                    </Button>
                </CardContent>
                </Card>
            )
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-4 mb-6">
          <CalendarDays className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-semibold font-headline">Événements & Compétitions</h2>
        </div>
        <div className="space-y-4">
          {upcomingEvents.map((event) => {
            const eventDate = event.date.toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
            return (
             <Card key={event.title} className="bg-card border-border/50 flex flex-col md:flex-row items-center p-4 gap-4 transition-all duration-300 hover:border-accent">
                <div className="flex-shrink-0 text-center md:text-left">
                    <p className="text-lg font-bold text-primary">{eventDate.split(' ')[0]} {eventDate.split(' ')[1]}</p>
                    <p className="text-sm text-muted-foreground">{eventDate.split(' ')[2]}</p>
                </div>
                <div className="border-l border-border/50 h-16 hidden md:block mx-4"></div>
                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <p className="text-muted-foreground">{event.category}</p>
                </div>
                <Button className="flex-shrink-0 bg-accent text-accent-foreground hover:bg-accent/80" onClick={() => handleRegistration(event.title)}>S'inscrire</Button>
             </Card>
          )})}
        </div>
      </section>
    </div>
  );
}

    