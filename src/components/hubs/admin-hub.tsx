
"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CalendarCheck, Settings, ArrowLeft, CalendarPlus, Landmark, FileSignature, Briefcase, Activity, Youtube, Home, Wallet, Cog } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const initialActivities: ClientActivity[] = [
    ...initialBookings.map((booking, index) => ({
        id: `act-${booking.id}`,
        clientName: booking.artistName,
        description: `Réservation: ${booking.projectName}`,
        category: "Réservation Studio" as const,
        totalAmount: booking.amount,
        date: booking.date,
        paymentType: "Direct" as const,
        paidAmount: booking.amount,
        remainingAmount: 0,
    })),
     {
        id: "act-livre-001",
        clientName: "Amina Dubois",
        phone: "+242 06 123 4567",
        description: "Achat: Le Labyrinthe d'Osiris",
        category: "Livre" as const,
        totalAmount: 12000,
        date: new Date("2024-07-28"),
        duration: undefined,
        paymentType: "Direct" as const,
        paidAmount: 12000,
        remainingAmount: 0
    },
    {
        id: "act-jeu-001",
        clientName: "Binta Traoré",
        phone: "+242 05 987 6543",
        description: "Session de jeu: 2h sur console",
        category: "Session de jeu" as const,
        totalAmount: 2000,
        date: new Date("2024-07-29"),
        duration: "2 heures",
        paymentType: "Direct" as const,
        paidAmount: 2000,
        remainingAmount: 0
    }
];


type AdminView = "dashboard" | "users" | "content" | "bookings" | "settings" | "events" | "financial" | "contracts" | "activities" | "platforms" | "fixed-costs";

export type AdminHubProps = {
  content: Content[];
  setContent: React.Dispatch<React.SetStateAction<Content[]>>;
  events: AppEvent[];
  setEvents: React.Dispatch<React.SetStateAction<AppEvent[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  setShowMainHeader: (show: boolean) => void;
}

type AdminSection = {
    title: string;
    icon: React.ElementType;
    view: AdminView;
};

type AdminCategory = {
    title: string;
    color: string;
    sections: AdminSection[];
};

const adminCategories: AdminCategory[] = [
    {
        title: "Gestion",
        color: "bg-blue-600/80 text-blue-50",
        sections: [
            { title: "Abonnements", icon: Users, view: "users" },
            { title: "Réservations", icon: CalendarCheck, view: "bookings" },
            { title: "Contrats", icon: FileSignature, view: "contracts" },
        ]
    },
    {
        title: "Finances",
        color: "bg-green-600/80 text-green-50",
        sections: [
            { title: "Rapport Financier", icon: Landmark, view: "financial" },
            { title: "Journal d'Activité", icon: Activity, view: "activities" },
            { title: "Paiements Plateformes", icon: Youtube, view: "platforms" },
            { title: "Charges Fixes", icon: Home, view: "fixed-costs" },
        ]
    },
    {
        title: "Contenu & Plateforme",
        color: "bg-purple-600/80 text-purple-50",
        sections: [
            { title: "Contenus", icon: FileText, view: "content" },
            { title: "Événements", icon: CalendarPlus, view: "events" },
            { title: "Paramètres", icon: Settings, view: "settings" }
        ]
    }
];


const AdminHub = forwardRef<any, AdminHubProps>(({ content, setContent, events, setEvents, bookings, setBookings, setShowMainHeader }, ref) => {
  const [activeView, setActiveView] = useState<AdminView>("dashboard");

  useImperativeHandle(ref, () => ({
    setActiveView
  }));

  // Removed local bookings state to use the one from props
  const [subscribers, setSubscribers] = useState<Subscriber[]>(iSubscribers);
  const [transactions, setTransactions] = useState<Transaction[]>(iTransactions);
  const [activities, setActivities] = useState<ClientActivity[]>(initialActivities);
  const [payouts, setPayouts] = useState<Payout[]>(iPayouts);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(iFixedCosts);


  const handleAddBooking = (newBooking: Omit<Booking, 'id' | 'status'>) => {
    // This function will be handled by page.tsx now, but we keep it for other potential uses
    // or pass the actual handler from page.tsx through props.
    // For now, let's assume page.tsx handles the state update and Firestore write.
    console.log("Adding booking in AdminHub is deprecated. Should be handled in page.tsx");
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
    setShowMainHeader(false);
  };
  
  const handleBack = () => {
    setActiveView("dashboard");
    setShowMainHeader(true);
  };
  
  const currentCategory = adminCategories.find(cat => cat.sections.some(sec => sec.view === activeView));

  const ViewComponent = activeView !== 'dashboard' ? adminViews[activeView].component : null;
  const currentTitle = activeView !== 'dashboard' ? adminViews[activeView].title : "PANNEAU D'ADMINISTRATION";
  const viewProps = activeView !== 'dashboard' ? adminViews[activeView].props : {};

  return (
    <div className="space-y-8">
      {activeView === 'dashboard' ? (
         <header>
            <h1 className="text-3xl font-bold text-primary font-headline tracking-wider">{currentTitle}</h1>
            <p className="text-muted-foreground">Gestion et administration de la plateforme KHEOPS.</p>
         </header>
      ) : (
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 -mt-8 mb-8 px-4">
             <div className="container flex h-16 items-center justify-between mx-auto">
                 <div className="flex items-center gap-4">
                     <Button variant="outline" size="icon" onClick={handleBack}>
                         <ArrowLeft className="h-5 w-5" />
                     </Button>
                      <div>
                        <h1 className="text-xl font-bold text-primary font-headline tracking-wider">{currentTitle}</h1>
                      </div>
                 </div>
                  {currentCategory && (
                    <nav className="flex items-center gap-2">
                        <TooltipProvider>
                         {currentCategory.sections.map(section => (
                            <Tooltip key={section.view}>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant={activeView === section.view ? "secondary" : "ghost"} 
                                        size="icon" 
                                        onClick={() => setActiveView(section.view)}
                                    >
                                        <section.icon className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{section.title}</p>
                                </TooltipContent>
                            </Tooltip>
                         ))}
                        </TooltipProvider>
                    </nav>
                  )}
             </div>
        </header>
      )}

      {activeView === 'dashboard' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {adminCategories.map((category) => (
            <div key={category.title} className={`p-6 rounded-xl shadow-lg ${category.color}`}>
              <h2 className="text-2xl font-bold font-headline mb-4 text-white">{category.title}</h2>
              <div className="grid grid-cols-2 gap-4">
                {category.sections.map((section) => (
                    <button
                        key={section.view}
                        onClick={() => handleAction(section.view)}
                        className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-lg text-center text-white/90 hover:bg-black/40 transition-colors duration-200"
                    >
                        <section.icon className="h-8 w-8 mb-2" />
                        <span className="text-sm font-medium">{section.title}</span>
                    </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
         ViewComponent && <ViewComponent {...viewProps as any} />
      )}
    </div>
  );
});

AdminHub.displayName = "AdminHub";
export default AdminHub;
