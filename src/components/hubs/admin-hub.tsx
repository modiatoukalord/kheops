"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CalendarCheck, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminHub() {
  const { toast } = useToast();

  const handleAction = (feature: string) => {
    toast({
      title: "Fonctionnalité en développement",
      description: `La section "${feature}" sera bientôt disponible.`,
    });
  };

  const adminSections = [
    {
      title: "Gestion des Utilisateurs",
      description: "Consulter, modifier ou bannir des utilisateurs.",
      icon: Users,
      action: "Gérer les utilisateurs",
      feature: "Gestion des Utilisateurs",
    },
    {
      title: "Gestion des Contenus",
      description: "Ajouter ou modifier des livres, articles et événements.",
      icon: FileText,
      action: "Gérer les contenus",
      feature: "Gestion des Contenus",
    },
    {
      title: "Réservations du Studio",
      description: "Voir et gérer le planning des réservations du studio.",
      icon: CalendarCheck,
      action: "Voir le planning",
      feature: "Réservations du Studio",
    },
    {
        title: "Paramètres du Site",
        description: "Configurer les options générales de la plateforme.",
        icon: Settings,
        action: "Accéder aux paramètres",
        feature: "Paramètres",
    }
  ];

  return (
    <div className="space-y-12">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary font-headline tracking-wider">PANNEAU D'ADMINISTRATION</h1>
        <p className="text-muted-foreground text-lg">Gestion et administration de la plateforme KHEOPS.</p>
      </header>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {adminSections.map((section) => (
            <Card key={section.title} className="bg-card border-border/50 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <section.icon className="w-8 h-8 text-accent" />
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" onClick={() => handleAction(section.feature)}>
                  {section.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
