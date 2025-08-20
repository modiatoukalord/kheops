"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CalendarCheck, Settings, ArrowLeft, CalendarPlus, Landmark } from "lucide-react";
import UserManagement from "@/components/admin/user-management";
import ContentManagement from "@/components/admin/content-management";
import BookingSchedule from "@/components/admin/booking-schedule";
import SiteSettings from "@/components/admin/site-settings";
import EventManagement from "@/components/admin/event-management";
import FinancialManagement from "@/components/admin/financial-management";

type AdminView = "dashboard" | "users" | "content" | "bookings" | "settings" | "events" | "financial";

const adminViews = {
    users: { component: UserManagement, title: "Gestion des Abonnements" },
    content: { component: ContentManagement, title: "Gestion des Contenus" },
    bookings: { component: BookingSchedule, title: "Planning des Réservations" },
    settings: { component: SiteSettings, title: "Paramètres du Site" },
    events: { component: EventManagement, title: "Gestion des Événements" },
    financial: { component: FinancialManagement, title: "Gestion Financière" },
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
      title: "Gestion des Abonnements",
      description: "Gérer les abonnements des utilisateurs.",
      icon: Users,
      action: "Gérer",
      view: "users" as AdminView,
      color: "bg-blue-500/80",
      textColor: "text-white",
      hoverColor: "hover:bg-blue-600/90",
    },
    {
      title: "Gestion des Contenus",
      description: "Ajouter ou modifier des livres et articles.",
      icon: FileText,
      action: "Gérer",
      view: "content" as AdminView,
      color: "bg-green-500/80",
      textColor: "text-white",
      hoverColor: "hover:bg-green-600/90",
    },
    {
      title: "Gestion des Événements",
      description: "Créer et gérer les événements et compétitions.",
      icon: CalendarPlus,
      action: "Gérer",
      view: "events" as AdminView,
      color: "bg-red-500/80",
      textColor: "text-white",
      hoverColor: "hover:bg-red-600/90",
    },
    {
      title: "Réservations du Studio",
      description: "Voir et gérer le planning des réservations du studio et gestionnaires des contrats.",
      icon: CalendarCheck,
      action: "Consulter",
      view: "bookings" as AdminView,
      color: "bg-purple-500/80",
      textColor: "text-white",
      hoverColor: "hover:bg-purple-600/90",
    },
    {
        title: "Gestion Financière",
        description: "Suivre les transactions et les revenus.",
        icon: Landmark,
        action: "Consulter",
        view: "financial" as AdminView,
        color: "bg-yellow-500/80",
        textColor: "text-white",
        hoverColor: "hover:bg-yellow-600/90",
    },
    {
        title: "Paramètres du Site",
        description: "Configurer les options générales de la plateforme.",
        icon: Settings,
        action: "Configurer",
        view: "settings" as AdminView,
        color: "bg-orange-500/80",
        textColor: "text-white",
        hoverColor: "hover:bg-orange-600/90",
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSections.map((section) => (
              <Card key={section.title} className={`${section.color} ${section.textColor} border-0 flex flex-col justify-between transition-all duration-300 ${section.hoverColor} hover:-translate-y-1 shadow-lg`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-4 text-2xl">
                    <section.icon className="w-10 h-10" />
                    {section.title}
                  </CardTitle>
                  <CardDescription className={`${section.textColor} opacity-80`}>{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end pt-6">
                  <Button className="bg-white/20 hover:bg-white/30 text-white" onClick={() => handleAction(section.view)}>
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
