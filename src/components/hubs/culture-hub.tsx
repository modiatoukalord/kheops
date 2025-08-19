"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, CalendarDays } from "lucide-react";

const culturalContent = [
  {
    title: "Le Labyrinthe d'Osiris",
    category: "Livre",
    image: "https://placehold.co/400x600",
    hint: "ancient scroll",
    description: "Plongez dans un thriller mystique au cœur de l'Égypte ancienne.",
  },
  {
    title: "Pharaoh's Legacy Vol. 1",
    category: "Manga",
    image: "https://placehold.co/400x600",
    hint: "manga cover",
    description: "Une aventure épique où des lycéens réveillent un pouvoir ancestral.",
  },
  {
    title: "Les Chroniques de Thot",
    category: "Livre",
    image: "https://placehold.co/400x600",
    hint: "egyptian book",
    description: "Découvrez les secrets de la sagesse et de la magie égyptienne.",
  },
  {
    title: "Article: L'art du Hiéroglyphe",
    category: "Article",
    image: "https://placehold.co/400x600",
    hint: "hieroglyphics wall",
    description: "Une analyse approfondie de l'écriture sacrée des pharaons.",
  },
];

const events = [
  {
    title: "Tournoi e-sport: La Fureur d'Anubis",
    date: "30 JUIL. 2024",
    description: "Compétition féroce sur le dernier jeu de stratégie en vogue. Lots exclusifs à gagner.",
  },
  {
    title: "Conférence: L'Influence de l'Égypte sur la Pop Culture",
    date: "15 AOÛT 2024",
    description: "Rencontre avec des experts pour décrypter l'omniprésence des mythes égyptiens.",
  },
  {
    title: "Atelier d'écriture de Manga",
    date: "02 SEPT. 2024",
    description: "Apprenez les bases de la narration et du dessin avec des artistes confirmés.",
  },
];

export default function CultureHub() {
  const { toast } = useToast();

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
          {culturalContent.map((item) => (
            <Card key={item.title} className="bg-card border-border/50 overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
              <CardHeader className="p-0">
                <Image src={item.image} alt={item.title} width={400} height={600} className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={item.hint}/>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Badge variant="secondary" className="text-accent-foreground bg-accent/20 border-accent/50">{item.category}</Badge>
                <CardTitle className="text-lg font-semibold text-primary-foreground">{item.title}</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">{item.description}</CardDescription>
                <Button variant="outline" className="w-full mt-2 border-primary/50 text-primary hover:bg-primary/10" onClick={() => handleDiscover(item.title)}>
                  Découvrir
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-4 mb-6">
          <CalendarDays className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-semibold font-headline">Événements & Compétitions</h2>
        </div>
        <div className="space-y-4">
          {events.map((event) => (
             <Card key={event.title} className="bg-card border-border/50 flex flex-col md:flex-row items-center p-4 gap-4 transition-all duration-300 hover:border-accent">
                <div className="flex-shrink-0 text-center md:text-left">
                    <p className="text-lg font-bold text-primary">{event.date.split(' ')[0]}</p>
                    <p className="text-sm text-muted-foreground">{event.date.substring(event.date.indexOf(' ') + 1)}</p>
                </div>
                <div className="border-l border-border/50 h-16 hidden md:block mx-4"></div>
                <div className="flex-grow text-center md:text-left">
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <p className="text-muted-foreground">{event.description}</p>
                </div>
                <Button className="flex-shrink-0 bg-accent text-accent-foreground hover:bg-accent/80" onClick={() => handleRegistration(event.title)}>S'inscrire</Button>
             </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
