
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CalendarCheck, Settings, ArrowLeft, CalendarPlus, Landmark, FileSignature, Briefcase } from "lucide-react";
import UserManagement, { Subscriber } from "@/components/admin/user-management";
import ContentManagement from "@/components/admin/content-management";
import BookingSchedule from "@/components/admin/booking-schedule";
import SiteSettings from "@/components/admin/site-settings";
import EventManagement from "@/components/admin/event-management";
import FinancialManagement, { Transaction } from "@/components/admin/financial-management";
import ContractManagement from "@/components/admin/contract-management";
import ClientManagement, { Client } from "@/components/admin/client-management";
import { initialSubscribers } from "@/components/admin/user-management";
import { initialBookings, Booking } from "@/components/admin/booking-schedule";
import { initialTransactions } from "@/components/admin/financial-management";
import { format } from "date-fns";

const initialClients: Client[] = initialBookings.map((booking, index) => ({
    id: `client-${booking.id}`,
    name: booking.artistName,
    email: `${booking.artistName.toLowerCase().replace(/\s/g, '.')}@example.com`,
    phone: `+242 06 555 01${index.toString().padStart(2, '0')}`,
    lastActivity: format(booking.date, "yyyy-MM-dd"),
    totalSpent: booking.amount,
}));


type AdminView = "dashboard" | "users" | "content" | "bookings" | "settings" | "events" | "financial" | "contracts" | "clients";

export default function AdminHub() {
  const [activeView, setActiveView] = useState<AdminView>("dashboard");

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [clients, setClients] = useState<Client[]>(initialClients);

  const handleAddBooking = (newBooking: Omit<Booking, 'id'>) => {
    const fullBooking = { ...newBooking, id: `res-${Date.now()}`};
    setBookings(prev => [fullBooking, ...prev]);
    
    // Add a corresponding transaction
    const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        date: format(fullBooking.date, "yyyy-MM-dd"),
        description: `Réservation studio - ${fullBooking.artistName}`,
        type: "Revenu",
        amount: fullBooking.amount,
        status: "En attente"
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Add or update client
    setClients(prevClients => {
        const existingClientIndex = prevClients.findIndex(c => c.name === fullBooking.artistName);
        if (existingClientIndex > -1) {
            const updatedClients = [...prevClients];
            const existingClient = updatedClients[existingClientIndex];
            updatedClients[existingClientIndex] = {
                ...existingClient,
                lastActivity: format(fullBooking.date, "yyyy-MM-dd"),
                totalSpent: existingClient.totalSpent + fullBooking.amount
            };
            return updatedClients;
        } else {
            return [
                ...prevClients,
                {
                    id: `client-${fullBooking.id}`,
                    name: fullBooking.artistName,
                    email: `${fullBooking.artistName.toLowerCase().replace(/\s/g, '.')}@example.com`,
                    phone: `+242 06 555 ${Math.floor(1000 + Math.random() * 9000).toString()}`,
                    lastActivity: format(fullBooking.date, "yyyy-MM-dd"),
                    totalSpent: fullBooking.amount,
                }
            ];
        }
    });
  };
  
  const handleValidateSubscription = (subscriber: Subscriber) => {
     // Add a corresponding transaction
    const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        date: format(new Date(), "yyyy-MM-dd"),
        description: `Abonnement - ${subscriber.name}`,
        type: "Revenu",
        amount: parseFloat(subscriber.amount.replace(/\s/g, '').replace('FCFA', '')),
        status: "Complété"
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };
  
  const handleAddSubscriber = (newSubscriber: Omit<Subscriber, 'id'>) => {
    const fullSubscriber = { ...newSubscriber, id: `user-${Date.now()}`};
    setSubscribers(prev => [fullSubscriber, ...prev]);
    handleValidateSubscription(fullSubscriber);
  };
  
  const handleRenewSubscriber = (subscriberToRenew: Subscriber, durationMonths: number) => {
    setSubscribers(prev => 
        prev.map(sub => 
            sub.id === subscriberToRenew.id
            ? { ...subscriberToRenew }
            : sub
        )
    );
     handleValidateSubscription(subscriberToRenew);
  };


  const adminViews = {
    users: { component: UserManagement, title: "Gestion des Abonnements", props: { subscribers, setSubscribers, onValidateSubscription: handleValidateSubscription, onAddSubscriber: handleAddSubscriber, onRenewSubscriber: handleRenewSubscriber } },
    content: { component: ContentManagement, title: "Gestion des Contenus", props: {} },
    bookings: { component: BookingSchedule, title: "Planning des Réservations", props: { bookings, setBookings, onAddBooking: handleAddBooking } },
    settings: { component: SiteSettings, title: "Paramètres du Site", props: {} },
    events: { component: EventManagement, title: "Gestion des Événements", props: {} },
    financial: { component: FinancialManagement, title: "Gestion Financière", props: { transactions, setTransactions } },
    contracts: { component: ContractManagement, title: "Gestion des Contrats", props: {} },
    clients: { component: ClientManagement, title: "Gestion des Clients", props: { clients, setClients } },
  };


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
      title: "Gestion des Clients",
      description: "Suivre les clients non-abonnés.",
      icon: Briefcase,
      action: "Consulter",
      view: "clients" as AdminView,
      color: "bg-indigo-500/80",
      textColor: "text-white",
      hoverColor: "hover:bg-indigo-600/90",
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
      description: "Voir et gérer le planning des réservations du studio.",
      icon: CalendarCheck,
      action: "Consulter",
      view: "bookings" as AdminView,
      color: "bg-purple-500/80",
      textColor: "text-white",
      hoverColor: "hover:bg-purple-600/90",
    },
    {
        title: "Gestion des Contrats",
        description: "Suivre et mettre à jour les contrats de réservation.",
        icon: FileSignature,
        action: "Gérer",
        view: "contracts" as AdminView,
        color: "bg-teal-500/80",
        textColor: "text-white",
        hoverColor: "hover:bg-teal-600/90",
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

  const ViewComponent = activeView !== 'dashboard' ? adminViews[activeView].component : null;
  const currentTitle = activeView !== 'dashboard' ? adminViews[activeView].title : "PANNEAU D'ADMINISTRATION";
  const viewProps = activeView !== 'dashboard' ? adminViews[activeView].props : {};


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
         ViewComponent && <ViewComponent {...viewProps} />
      )}
    </div>
  );
}
