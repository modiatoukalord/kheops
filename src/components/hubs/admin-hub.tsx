
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CalendarCheck, Settings, ArrowLeft, CalendarPlus, Landmark, FileSignature, Briefcase, Activity, Youtube, Home } from "lucide-react";
import UserManagement, { Subscriber, initialSubscribers as iSubscribers } from "@/components/admin/user-management";
import ContentManagement, { initialContent as iContent, Content } from "@/components/admin/content-management";
import BookingSchedule, { initialBookings, Booking } from "@/components/admin/booking-schedule";
import SiteSettings from "@/components/admin/site-settings";
import EventManagement, { initialEvents as iEvents, AppEvent } from "@/components/admin/event-management";
import FinancialManagement, { Transaction, initialTransactions as iTransactions } from "@/components/admin/financial-management";
import ContractManagement from "@/components/admin/contract-management";
import ActivityLog, { ClientActivity } from "@/components/admin/activity-log";
import PlatformManagement, { Payout, initialPayouts as iPayouts } from "@/components/admin/platform-management";
import FixedCostsManagement, { FixedCost, initialFixedCosts as iFixedCosts } from "@/components/admin/fixed-costs-management";
import { format } from "date-fns";

const initialActivities: ClientActivity[] = [
    ...initialBookings.map((booking, index) => ({
        id: `act-${booking.id}`,
        clientName: booking.artistName,
        description: `Réservation: ${booking.projectName}`,
        category: "Réservation Studio" as const,
        amount: booking.amount,
        date: booking.date,
    })),
     {
        id: "act-livre-001",
        clientName: "Amina Dubois",
        phone: "+242 06 123 4567",
        description: "Achat: Le Labyrinthe d'Osiris",
        category: "Livre" as const,
        amount: 12000,
        date: new Date("2024-07-28"),
        duration: undefined,
    },
    {
        id: "act-jeu-001",
        clientName: "Binta Traoré",
        phone: "+242 05 987 6543",
        description: "Session de jeu: 2h sur console",
        category: "Session de jeu" as const,
        amount: 2000,
        date: new Date("2024-07-29"),
        duration: "2 heures",
    }
];


type AdminView = "dashboard" | "users" | "content" | "bookings" | "settings" | "events" | "financial" | "contracts" | "activities" | "platforms" | "fixed-costs";

export type AdminHubProps = {
  content: Content[];
  setContent: React.Dispatch<React.SetStateAction<Content[]>>;
  events: AppEvent[];
  setEvents: React.Dispatch<React.SetStateAction<AppEvent[]>>;
}

export default function AdminHub({ content, setContent, events, setEvents }: AdminHubProps) {
  const [activeView, setActiveView] = useState<AdminView>("dashboard");

  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(iSubscribers);
  const [transactions, setTransactions] = useState<Transaction[]>(iTransactions);
  const [activities, setActivities] = useState<ClientActivity[]>(initialActivities);
  const [payouts, setPayouts] = useState<Payout[]>(iPayouts);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(iFixedCosts);


  const handleAddBooking = (newBooking: Omit<Booking, 'id'>) => {
    const fullBooking = { ...newBooking, id: `res-${Date.now()}`};
    setBookings(prev => [fullBooking, ...prev]);
    
    // Add a corresponding transaction
    const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        date: format(fullBooking.date, "yyyy-MM-dd"),
        description: `Réservation studio - ${fullBooking.artistName}`,
        type: "Revenu",
        category: "Prestation Studio",
        amount: fullBooking.amount,
        status: "En attente"
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Add a corresponding activity
    const newActivity: ClientActivity = {
        id: `act-${fullBooking.id}`,
        clientName: fullBooking.artistName,
        description: `Réservation: ${fullBooking.projectName}`,
        category: "Réservation Studio",
        amount: fullBooking.amount,
        date: fullBooking.date,
    };
    setActivities(prev => [newActivity, ...prev]);
  };
  
  const handleValidateSubscription = (subscriber: Subscriber) => {
     // Add a corresponding transaction
    const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        date: format(new Date(), "yyyy-MM-dd"),
        description: `Abonnement - ${subscriber.name}`,
        type: "Revenu",
        category: "Abonnement",
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

  const handleAddPayout = (newPayout: Omit<Payout, 'id'>) => {
    const fullPayout = { ...newPayout, id: `p-${Date.now()}` };
    setPayouts(prev => [fullPayout, ...prev]);

    const newTransaction: Transaction = {
        id: `txn-payout-${fullPayout.id}`,
        date: format(new Date(fullPayout.date.split('/').reverse().join('-')), 'yyyy-MM-dd'),
        description: `Paiement plateforme - ${fullPayout.platform}`,
        type: "Revenu",
        category: "Paiement Plateforme",
        amount: parseFloat(fullPayout.amount.replace(/\s/g, '').replace('FCFA', '')),
        status: "Complété"
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };
  
  const handleAddFixedCost = (newCost: Omit<FixedCost, 'id'>) => {
    const fullCost = { ...newCost, id: `fc-${Date.now()}` };
    setFixedCosts(prev => [fullCost, ...prev]);

    const newTransaction: Transaction = {
        id: `txn-fc-${fullCost.id}`,
        date: format(fullCost.paymentDate, "yyyy-MM-dd"),
        description: `Charge Fixe: ${fullCost.name}`,
        type: "Dépense",
        category: fullCost.category,
        amount: -fullCost.amount,
        status: "Complété"
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };


  const adminViews = {
    users: { component: UserManagement, title: "Gestion des Abonnements", props: { subscribers, setSubscribers, onValidateSubscription: handleValidateSubscription, onAddSubscriber: handleAddSubscriber, onRenewSubscriber: handleRenewSubscriber } },
    content: { component: ContentManagement, title: "Gestion des Contenus", props: { content, setContent } },
    bookings: { component: BookingSchedule, title: "Planning des Réservations", props: { bookings, setBookings, onAddBooking: handleAddBooking } },
    settings: { component: SiteSettings, title: "Paramètres du Site", props: {} },
    events: { component: EventManagement, title: "Gestion des Événements", props: { events, setEvents } },
    financial: { component: FinancialManagement, title: "Rapport Financier", props: { transactions, setTransactions } },
    contracts: { component: ContractManagement, title: "Gestion des Contrats", props: {} },
    activities: { component: ActivityLog, title: "Journal d'Activité", props: { activities, setActivities } },
    platforms: { component: PlatformManagement, title: "Gestion des Plateformes", props: { payouts, setPayouts, onAddPayout: handleAddPayout } },
    "fixed-costs": { component: FixedCostsManagement, title: "Gestion des Charges Fixes", props: { fixedCosts, setFixedCosts, onAddFixedCost: handleAddFixedCost } },
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
      title: "Journal d'Activité",
      description: "Suivre les achats et services ponctuels.",
      icon: Activity,
      action: "Consulter",
      view: "activities" as AdminView,
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
        title: "Rapport Financier",
        description: "Suivre les transactions et les revenus.",
        icon: Landmark,
        action: "Consulter",
        view: "financial" as AdminView,
        color: "bg-yellow-500/80",
        textColor: "text-white",
        hoverColor: "hover:bg-yellow-600/90",
    },
    {
      title: "Charges Fixes",
      description: "Gérer les dépenses récurrentes (loyer, salaires...).",
      icon: Home,
      action: "Gérer",
      view: "fixed-costs" as AdminView,
      color: "bg-orange-500/80",
      textColor: "text-white",
      hoverColor: "hover:bg-orange-600/90",
    },
    {
      title: "Gestion des Plateformes",
      description: "Suivre les revenus des plateformes (YouTube, TikTok...).",
      icon: Youtube,
      action: "Consulter",
      view: "platforms" as AdminView,
      color: "bg-gray-700/80",
      textColor: "text-white",
      hoverColor: "hover:bg-gray-800/90",
    },
    {
        title: "Paramètres du Site",
        description: "Configurer les options générales de la plateforme.",
        icon: Settings,
        action: "Configurer",
        view: "settings" as AdminView,
        color: "bg-slate-500/80",
        textColor: "text-white",
        hoverColor: "hover:bg-slate-600/90",
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
         ViewComponent && <ViewComponent {...viewProps as any} />
      )}
    </div>
  );
}

    