"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CalendarCheck, Settings, ArrowLeft } from "lucide-react";
import UserManagement from "@/components/admin/user-management";
import ContentManagement from "@/components/admin/content-management";
import BookingSchedule from "@/components/admin/booking-schedule";
import SiteSettings from "@/components/admin/site-settings";

type AdminView = "dashboard" | "users" | "content" | "bookings" | "settings";

const adminViews = {
    users: { component: UserManagement, title: "Gestion des Utilisateurs" },
    content: { component: ContentManagement, title: "Gestion des Contenus" },
    bookings: { component: BookingSchedule, title: "Planning des Réservations" },
    settings: { component: SiteSettings, title: "Paramètres du Site" },
};

export default function AdminHub() {
  const [activeView, setActiveView] = useState<AdminView>("dashboard");

  const handleAction = (view: AdminView) => {
    setActiveView(view);
  };
  
  const handleBack = () => {
    setActiveView("dashboard");
  };

  const adminSections = [
    {
      title: "Gestion des Utilisateurs",
      description: "Consulter, modifier ou bannir des utilisateurs.",
      icon: Users,
      action: "Gérer les utilisateurs",
      view: "users" as AdminView,
    },
    {
      title: "Gestion des Contenus",
      description: "Ajouter ou modifier des livres, articles et événements.",
      icon: FileText,
      action: "Gérer les contenus",
      view: "content" as AdminView,
    },
    {
      title: "Réservations du Studio",
      description: "Voir et gérer le planning des réservations du studio.",
      icon: CalendarCheck,
      action: "Voir le planning",
      view: "bookings" as AdminView,
    },
    {
        title: "Paramètres du Site",
        description: "Configurer les options générales de la plateforme.",
        icon: Settings,
        action: "Accéder aux paramètres",
        view: "settings" as AdminView,
    }
  ];

  const CurrentView = activeView !== 'dashboard' ? adminViews[activeView].component : null;
  const currentTitle = activeView !== 'dashboard' ? adminViews[activeView].title : "PANNEAU D'ADMINISTRATION";

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            {activeView !== 'dashboard' && (
                <Button variant="outline" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            )}
            <div>
                <h1 className="text-3xl font-bold text-primary font-headline tracking-wider">{currentTitle}</h1>
                <p className="text-muted-foreground">
                    {activeView === 'dashboard' ? "Gestion et administration de la plateforme KHEOPS." : `Section dédiée à: ${currentTitle}`}
                </p>
            </div>
        </div>
      </header>

      {activeView === 'dashboard' ? (
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
                  <Button className="w-full" variant="outline" onClick={() => handleAction(section.view)}>
                    {section.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : (
         CurrentView && <CurrentView />
      )}
    </div>
  );
}
