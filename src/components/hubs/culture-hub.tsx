
"use client";

import React, { useState } from "react";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CalendarDays, BookCopy, FileText, Film, Puzzle, User, Phone } from "lucide-react";
import type { Content } from "@/components/admin/content-management";
import type { AppEvent } from "@/components/admin/event-management";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

type CulturalContent = Pick<Content, 'title' | 'type' | 'imageUrl'> & { description: string; hint: string };

const placeholderDescriptions: { [key: string]: string } = {
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
    "Projet Studio": () => null,
    "Produit Wear": () => null,
};


interface CultureHubProps {
    content: Content[];
    events: AppEvent[];
    onEventRegistration: (registrationData: { eventId: string; eventName: string; participantName: string; participantPhone: string; }) => void;
}


export default function CultureHub({ content, events, onEventRegistration }: CultureHubProps) {
  const { toast } = useToast();
  const [isRegisterOpen, setRegisterOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);

  const culturalContent: CulturalContent[] = content
    .filter(c => c.status === "Publié" && c.type !== 'Projet Studio' && c.type !== 'Produit Wear')
    .map((c, index) => ({
        title: c.title,
        type: c.type,
        description: placeholderDescriptions[c.title] || `Découvrez le contenu de ${c.title}.`,
        imageUrl: c.imageUrl || `https://picsum.photos/seed/culture${index}/400/300`,
        hint: c.title.toLowerCase().split(' ').slice(0,2).join(' ')
    }));
    
  const upcomingEvents = events
    .filter(event => (event.endDate || event.startDate) >= new Date())
    .sort((a,b) => a.startDate.getTime() - b.startDate.getTime());


  const handleMembership = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "L'adhésion membre n'est pas encore disponible.",
    });
  };

  const handleOpenRegistration = (event: AppEvent) => {
    setSelectedEvent(event);
    setRegisterOpen(true);
  };
  
  const handleRegistrationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const formData = new FormData(e.currentTarget);
    const participantName = formData.get("name") as string;
    const participantPhone = formData.get("phone") as string;

    if (participantName && participantPhone) {
        onEventRegistration({
            eventId: selectedEvent.id,
            eventName: selectedEvent.title,
            participantName,
            participantPhone,
        });

        setRegisterOpen(false);
        setSelectedEvent(null);
        toast({
          title: "Inscription Réussie !",
          description: `Merci, votre inscription pour "${selectedEvent.title}" a bien été prise en compte.`,
        });
    }
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
        <Carousel
          opts={{
            align: "start",
            loop: culturalContent.length > 4,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {culturalContent.map((item, index) => {
              const Icon = categoryIcons[item.type];
              return (
                <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/4">
                  <div className="p-1">
                    <Card className="bg-card border-border/50 flex flex-col justify-between overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 h-full">
                      <div className="aspect-[4/3] overflow-hidden">
                          <Image 
                            src={item.imageUrl}
                            alt={`Image pour ${item.title}`}
                            width={400}
                            height={300}
                            data-ai-hint={item.hint}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                          />
                      </div>
                      <CardContent className="p-4 space-y-2 text-center flex flex-col flex-grow">
                          <Badge variant="secondary" className="text-accent-foreground bg-accent/20 border-accent/50 w-fit mx-auto flex items-center gap-1.5">
                            {Icon && <Icon className="h-3.5 w-3.5"/>}
                            {item.type}
                          </Badge>
                          <CardTitle className="text-lg font-semibold text-primary-foreground">{item.title}</CardTitle>
                          <CardDescription className="text-muted-foreground text-sm flex-grow">{item.description}</CardDescription>
                          <Button variant="outline" className="w-full mt-2 border-primary/50 text-primary hover:bg-primary/10" onClick={() => handleDiscover(item.title)}>
                          Découvrir
                          </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex"/>
        </Carousel>
      </section>

      <section>
        <div className="flex items-center gap-4 mb-6">
          <CalendarDays className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-semibold font-headline">Événements & Compétitions</h2>
        </div>
        <div className="space-y-4">
          {upcomingEvents.map((event) => {
            const formatEventDate = (event: AppEvent) => {
                const startDate = format(event.startDate, "d MMM", { locale: fr });
                if (event.endDate) {
                    const endDate = format(event.endDate, "d MMM yyyy", { locale: fr });
                    if (event.startDate.getMonth() === event.endDate.getMonth()) {
                         return `Du ${format(event.startDate, "d")} au ${endDate}`;
                    }
                    return `Du ${startDate} au ${endDate}`;
                }
                return `Le ${startDate} ${format(event.startDate, "yyyy")}`;
            };

            return (
             <Card key={event.id} className="bg-card border-border/50 flex flex-col md:flex-row items-center p-4 gap-4 transition-all duration-300 hover:border-accent">
                <div className="flex-shrink-0 text-center md:text-left">
                    <p className="text-lg font-bold text-primary">{format(event.startDate, "d MMM", { locale: fr }).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">{format(event.startDate, "yyyy")}</p>
                </div>
                <div className="border-l border-border/50 h-16 hidden md:block mx-4"></div>
                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <p className="text-muted-foreground">{formatEventDate(event)}</p>
                </div>
                <Button className="flex-shrink-0 bg-accent text-accent-foreground hover:bg-accent/80" onClick={() => handleOpenRegistration(event)}>S'inscrire</Button>
             </Card>
          )})}
        </div>
      </section>

      <Dialog open={isRegisterOpen} onOpenChange={setRegisterOpen}>
          <DialogContent>
              <form onSubmit={handleRegistrationSubmit}>
                  <DialogHeader>
                      <DialogTitle>S'inscrire à l'événement</DialogTitle>
                      <DialogDescription>
                          Confirmez votre participation pour "{selectedEvent?.title}".
                      </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-6">
                      <div className="space-y-2">
                          <Label htmlFor="name">Votre Nom Complet</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="name" name="name" placeholder="Ex: Jean Dupont" className="pl-10" required />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="phone">Votre Numéro de Téléphone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="phone" name="phone" placeholder="Ex: +242 06 123 4567" className="pl-10" required />
                          </div>
                      </div>
                  </div>
                  <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setRegisterOpen(false)}>Annuler</Button>
                      <Button type="submit">Confirmer l'inscription</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </div>
  );
}
