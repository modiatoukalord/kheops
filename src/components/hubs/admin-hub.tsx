
"use client";

import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CalendarCheck, Settings, ArrowLeft, CalendarPlus, Landmark, FileSignature, Briefcase, Activity, Youtube, Home, Wallet, Cog, DollarSign, Clipboard, MicVocal, GanttChart } from "lucide-react";
import UserManagement, { Subscriber } from "@/components/admin/user-management";
import ContentManagement, { initialContent as iContent, Content } from "@/components/admin/content-management";
import BookingSchedule, { Booking } from "@/components/admin/booking-schedule";
import SiteSettings from "@/components/admin/site-settings";
import EventManagement, { AppEvent } from "@/components/admin/event-management";
import FinancialManagement, { Transaction } from "@/components/admin/financial-management";
import ContractManagement, { Contract } from "@/components/admin/contract-management";
import ActivityLog from "@/components/admin/activity-log";
import PlatformManagement, { Payout, initialPayouts as iPayouts } from "@/components/admin/platform-management";
import FixedCostsManagement, { FixedCost } from "@/components/admin/fixed-costs-management";
import PricingSettings from "@/components/admin/pricing-settings";
import HumanResourcesManagement, { Employee } from "@/components/admin/human-resources-management";
import OrgChart from "@/components/admin/org-chart";
import { format, parseISO } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, updateDoc, doc, addDoc, deleteDoc, Timestamp } from "firebase/firestore";


type AdminView = "dashboard" | "users" | "content" | "bookings" | "settings" | "events" | "financial" | "contracts" | "activities" | "platforms" | "fixed-costs" | "pricing" | "hr" | "org-chart";

export type { Contract, Payout };

export type AdminHubProps = {
  content: Content[];
  onAddContent: (content: Omit<Content, 'id'>) => Promise<void>;
  onUpdateContent: (id: string, content: Partial<Omit<Content, 'id'>>) => Promise<void>;
  onDeleteContent: (id: string) => Promise<void>;
  events: AppEvent[];
  onAddEvent: (event: Omit<AppEvent, 'id'>) => void;
  onUpdateEvent: (id: string, event: Partial<Omit<AppEvent, 'id'>>) => void;
  onDeleteEvent: (id: string) => void;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  onUpdateBookingStatus: (bookingId: string, newStatus: Booking['status']) => void;
  onAddBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  subscribers: Subscriber[];
  onAddSubscriber: (subscriber: Omit<Subscriber, 'id'>) => Promise<void>;
  onUpdateSubscriber: (id: string, subscriber: Partial<Omit<Subscriber, 'id'>>) => Promise<void>;
  onDeleteSubscriber: (id: string) => Promise<void>;
  employees: Employee[];
  onAddEmployee: (employeeData: Omit<Employee, 'id'>) => Promise<void>;
  onUpdateEmployee: (id: string, employeeData: Partial<Omit<Employee, 'id'>>) => Promise<void>;
  onDeleteEmployee: (id: string) => Promise<void>;
  onUpdateContract: (id: string, data: Partial<Omit<Contract, 'id'>>) => Promise<void>;
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
            { title: "Personnel", icon: Briefcase, view: "hr" },
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
            { title: "Organigramme", icon: GanttChart, view: "org-chart" },
            { title: "Paramètres", icon: Settings, view: "settings" },
        ]
    },
     {
        title: "Configuration",
        color: "bg-orange-600/80 text-orange-50",
        sections: [
            { title: "Tarifs", icon: DollarSign, view: "pricing" },
        ]
    }
];


const AdminHub = forwardRef<any, AdminHubProps>(({ 
    content, onAddContent, onUpdateContent, onDeleteContent,
    events, onAddEvent, onUpdateEvent, onDeleteEvent, 
    bookings, setBookings, onUpdateBookingStatus, onAddBooking,
    transactions, onAddTransaction,
    subscribers, onAddSubscriber, onUpdateSubscriber, onDeleteSubscriber,
    employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee,
    onUpdateContract,
    setShowMainHeader 
}, ref) => {
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [contractToPay, setContractToPay] = useState<Contract | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const activityLogRef = useRef<{ openDialog: (data: any) => void }>(null);

  useImperativeHandle(ref, () => ({
    setActiveView
  }));

  const [payouts, setPayouts] = useState<Payout[]>(iPayouts);

  useEffect(() => {
    setShowMainHeader(activeView === 'dashboard');
  }, [activeView, setShowMainHeader]);
  
  useEffect(() => {
    const qContracts = query(collection(db, "contracts"));
    const unsubContracts = onSnapshot(qContracts, (snapshot) => {
        setContracts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contract)));
    });
    
    const qFixedCosts = query(collection(db, "fixedCosts"));
    const unsubFixedCosts = onSnapshot(qFixedCosts, (snapshot) => {
        const costsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                paymentDate: data.paymentDate.toDate(),
            } as FixedCost;
        });
        setFixedCosts(costsData);
    });

    return () => {
      unsubContracts();
      unsubFixedCosts();
    };
  }, []);

  
  const handleValidateSubscription = (subscriber: Subscriber) => {
    const newTransaction: Omit<Transaction, 'id'> = {
        date: format(new Date(), "yyyy-MM-dd"),
        description: `Abonnement - ${subscriber.name}`,
        type: "Revenu",
        category: "Abonnement",
        amount: parseFloat(subscriber.amount.replace(/\s/g, '').replace('FCFA', '')),
        status: "Complété"
    };
    onAddTransaction(newTransaction);
  };
  
  const handleAddSubscriber = (newSubscriber: Omit<Subscriber, 'id'>) => {
    onAddSubscriber(newSubscriber);
    handleValidateSubscription({ ...newSubscriber, id: 'temp-id-for-transaction' });
  };
  
  const handleRenewSubscriber = (subscriberToRenew: Subscriber, durationMonths: number) => {
    onUpdateSubscriber(subscriberToRenew.id, { ...subscriberToRenew });
    handleValidateSubscription(subscriberToRenew);
  };

  const handleAddPayout = (newPayout: Omit<Payout, 'id'>) => {
    const fullPayout = { ...newPayout, id: `p-${Date.now()}` };
    setPayouts(prev => [fullPayout, ...prev]);

    const newTransaction: Omit<Transaction, 'id'> = {
        date: format(new Date(newPayout.date.split('/').reverse().join('-')), 'yyyy-MM-dd'),
        description: `Paiement plateforme - ${newPayout.platform}`,
        type: "Revenu",
        category: "Paiement Plateforme",
        amount: parseFloat(newPayout.amount.replace(/\s/g, '').replace('FCFA', '')),
        status: "Complété"
    };
    onAddTransaction(newTransaction);
  };
  
  const handleAddFixedCost = async (newCost: Omit<FixedCost, 'id'>) => {
    await addDoc(collection(db, "fixedCosts"), newCost);
    const newTransaction: Omit<Transaction, 'id'> = {
        date: format(newCost.paymentDate, "yyyy-MM-dd"),
        description: `Charge Fixe: ${newCost.name}`,
        type: "Dépense",
        category: newCost.category,
        amount: -newCost.amount,
        status: "Complété"
    };
    onAddTransaction(newTransaction);
  };

  const handleUpdateFixedCost = async (id: string, updatedCost: Partial<Omit<FixedCost, 'id'>>) => {
      const costRef = doc(db, "fixedCosts", id);
      await updateDoc(costRef, updatedCost);
  };

  const handleDeleteFixedCost = async (id: string) => {
      await deleteDoc(doc(db, "fixedCosts", id));
  };


  const handleRequestContractPayment = (contract: Contract) => {
    setContractToPay(contract);
    setActiveView("activities");
  };
  
  const onContractPaid = async (contractId: string) => {
    const contractRef = doc(db, "contracts", contractId);
    await updateDoc(contractRef, { paymentStatus: 'Payé' });
    setContractToPay(null);
    setActiveView('contracts'); // Go back to contracts view
  };

  const adminViews = {
    users: { component: UserManagement, title: "Gestion des Abonnements", props: { subscribers, onAddSubscriber: handleAddSubscriber, onUpdateSubscriber, onDeleteSubscriber, onValidateSubscription: handleValidateSubscription, onRenewSubscriber: handleRenewSubscriber } },
    content: { component: ContentManagement, title: "Gestion des Contenus", props: { content, onAddContent, onUpdateContent, onDeleteContent } },
    bookings: { component: BookingSchedule, title: "Planning des Réservations", props: { bookings, onAddBooking, onUpdateBookingStatus, contracts } },
    settings: { component: SiteSettings, title: "Paramètres du Site", props: {} },
    events: { component: EventManagement, title: "Gestion des Événements", props: { events, onAddEvent, onUpdateEvent, onDeleteEvent } },
    financial: { component: FinancialManagement, title: "Rapport Financier", props: { transactions, onAddTransaction } },
    contracts: { component: ContractManagement, title: "Gestion des Contrats", props: { onUpdateContract, onCollectPayment: handleRequestContractPayment } },
    activities: { component: ActivityLog, title: "Journal d'Activité", props: { bookings, contracts, onAddTransaction, onUpdateBookingStatus, ref: activityLogRef, contractToPay, onContractPaid } },
    platforms: { component: PlatformManagement, title: "Gestion des Plateformes", props: { payouts, setPayouts, onAddPayout: handleAddPayout } },
    "fixed-costs": { component: FixedCostsManagement, title: "Gestion des Charges Fixes", props: { fixedCosts, onAddFixedCost: handleAddFixedCost, onUpdateFixedCost: handleUpdateFixedCost, onDeleteFixedCost: handleDeleteFixedCost } },
    pricing: { component: PricingSettings, title: "Tarifs des Services", props: {} },
    hr: { component: HumanResourcesManagement, title: "Gestion du Personnel", props: { employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee } },
    "org-chart": { component: OrgChart, title: "Organigramme", props: { employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee } },
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
                            <Tooltip key={`${section.view}-${section.title}`}>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {adminCategories.map((category) => (
            <div key={category.title} className={`p-6 rounded-xl shadow-lg ${category.color}`}>
              <h2 className="text-2xl font-bold font-headline mb-4 text-white">{category.title}</h2>
              <div className="grid grid-cols-2 gap-4">
                {category.sections.map((section) => (
                    <button
                        key={`${section.view}-${section.title}`}
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
