
"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import type { ComponentType } from "react";
import Header from "@/components/layout/header";
import CultureHub from "@/components/hubs/culture-hub";
import StudioHub from "@/components/hubs/studio-hub";
import WearHub from "@/components/hubs/wear-hub";
import AdminHub, { Contract, Payout } from "@/components/hubs/admin-hub";
import { initialContent, Content } from "@/components/admin/content-management";
import { AppEvent } from "@/components/admin/event-management";
import { Booking } from "@/components/admin/booking-schedule";
import { Transaction } from "@/components/admin/financial-management";
import { Subscriber } from "@/components/admin/user-management";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";


type Hubs = {
  [key: string]: ComponentType<any>;
};

const hubComponents: Hubs = {
  culture: CultureHub,
  studio: StudioHub,
  wear: WearHub,
  admin: AdminHub,
};

export interface EventRegistration {
    id: string;
    eventId: string;
    eventName: string;
    participantName: string;
    participantPhone: string;
    registrationDate: Date;
}


function HomePageContent() {
  const searchParams = useSearchParams();
  const [activeHub, setActiveHub] = useState("culture");
  const [showMainHeader, setShowMainHeader] = useState(true);
  const [content, setContent] = useState<Content[]>(initialContent);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const adminHubRef = useRef<{ setActiveView: (view: any) => void }>(null);

  useEffect(() => {
      const hub = searchParams.get('hub');
      const view = searchParams.get('view');
      if (hub === 'admin') {
          setActiveHub('admin');
          if (view && adminHubRef.current) {
              adminHubRef.current.setActiveView(view);
          }
      }
  }, [searchParams]);

  useEffect(() => {
    const fetchBookings = onSnapshot(query(collection(db, "bookings"), orderBy("date", "desc")), (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate(),
                tracks: data.tracks?.map((track: any) => ({
                    ...track,
                    date: (track.date as Timestamp).toDate(),
                }))
            } as Booking;
        });
        setBookings(bookingsData);
        setIsLoading(false);
    }, (error) => {
        console.error("Error fetching bookings: ", error);
        setBookings([]);
        setIsLoading(false);
    });

    const fetchEvents = onSnapshot(query(collection(db, "events"), orderBy("startDate", "desc")), (snapshot) => {
        const eventsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startDate: (data.startDate as Timestamp).toDate(),
                endDate: data.endDate ? (data.endDate as Timestamp).toDate() : undefined,
            } as AppEvent;
        });
        setEvents(eventsData);
    }, (error) => {
        console.error("Error fetching events: ", error);
    });

    const fetchTransactions = onSnapshot(query(collection(db, "transactions"), orderBy("date", "desc")), (snapshot) => {
        const transactionsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
            } as Transaction;
        });
        setTransactions(transactionsData);
    }, (error) => {
        console.error("Error fetching transactions: ", error);
    });
    
    const fetchSubscribers = onSnapshot(query(collection(db, "subscribers"), orderBy("startDate", "desc")), (snapshot) => {
        const subscribersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
            } as Subscriber;
        });
        setSubscribers(subscribersData);
    }, (error) => {
        console.error("Error fetching subscribers: ", error);
    });

    const fetchRegistrations = onSnapshot(query(collection(db, "registrations"), orderBy("registrationDate", "desc")), (snapshot) => {
        const registrationsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                registrationDate: (data.registrationDate as Timestamp).toDate(),
            } as EventRegistration;
        });
        setRegistrations(registrationsData);
    }, (error) => {
        console.error("Error fetching registrations: ", error);
    });

    return () => {
        fetchBookings();
        fetchEvents();
        fetchTransactions();
        fetchSubscribers();
        fetchRegistrations();
    };
  }, []);

  const handleSetActiveHub = (hub: "culture" | "studio" | "wear" | "admin") => {
    setActiveHub(hub);
    if (hub !== 'admin' && adminHubRef.current) {
      // Reset admin view when leaving admin hub
      adminHubRef.current.setActiveView('dashboard');
    }
  }


  const handleAddBooking = async (newBookingData: Omit<Booking, 'id' | 'status'>) => {
    try {
        const bookingPayload: Omit<Booking, 'id'> = {
            ...newBookingData,
            status: "En attente" as const,
        };

        await addDoc(collection(db, "bookings"), bookingPayload);
        // State update will be handled by onSnapshot listener
    } catch (error) {
        console.error("Error adding document: ", error);
    }
  };

    const handleUpdateBookingStatus = async (bookingId: string, newStatus: Booking['status']) => {
        try {
            const bookingRef = doc(db, "bookings", bookingId);
            await updateDoc(bookingRef, { status: newStatus });
        } catch (error) {
            console.error("Error updating booking status: ", error);
        }
    };
  
  const handleAddEvent = async (newEventData: Omit<AppEvent, 'id'>) => {
      try {
          await addDoc(collection(db, "events"), newEventData);
      } catch (error) {
          console.error("Error adding event: ", error);
      }
  };

  const handleUpdateEvent = async (eventId: string, updatedEventData: Partial<Omit<AppEvent, 'id'>>) => {
      try {
          const eventRef = doc(db, "events", eventId);
          await updateDoc(eventRef, updatedEventData);
      } catch (error) {
          console.error("Error updating event: ", error);
      }
  };

  const handleDeleteEvent = async (eventId: string) => {
      try {
          await deleteDoc(doc(db, "events", eventId));
      } catch (error) {
          console.error("Error deleting event: ", error);
      }
  };
  
  const handleEventRegistration = async (registrationData: Omit<EventRegistration, 'id' | 'registrationDate'>) => {
    try {
      await addDoc(collection(db, "registrations"), {
        ...registrationData,
        registrationDate: new Date(),
      });
    } catch (error) {
      console.error("Error adding registration: ", error);
    }
  };

  const handleAddTransaction = async (newTransactionData: Omit<Transaction, 'id'>) => {
    try {
      await addDoc(collection(db, "transactions"), newTransactionData);
    } catch (error) {
      console.error("Error adding transaction: ", error);
    }
  };
  
  const handleAddSubscriber = async (newSubscriberData: Omit<Subscriber, 'id'>) => {
    try {
      await addDoc(collection(db, "subscribers"), newSubscriberData);
    } catch (error) {
      console.error("Error adding subscriber: ", error);
    }
  };

  const handleUpdateSubscriber = async (subscriberId: string, updatedSubscriberData: Partial<Omit<Subscriber, 'id'>>) => {
    try {
      const subscriberRef = doc(db, "subscribers", subscriberId);
      await updateDoc(subscriberRef, updatedSubscriberData);
    } catch (error) {
      console.error("Error updating subscriber: ", error);
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    try {
      await deleteDoc(doc(db, "subscribers", subscriberId));
    } catch (error) {
      console.error("Error deleting subscriber: ", error);
    }
  };

  const handleUpdateContract = async (contractId: string, updatedContractData: Partial<Omit<Contract, 'id'>>) => {
      try {
          // This assumes contracts are stored in a 'contracts' collection
          const contractRef = doc(db, "contracts", contractId);
          await updateDoc(contractRef, updatedContractData);
      } catch (error) {
          console.error("Error updating contract: ", error);
      }
  }


  const ActiveComponent = hubComponents[activeHub];

  const componentProps: { [key: string]: any } = {
    culture: { content, events, onEventRegistration: handleEventRegistration },
    studio: { bookings, onAddBooking: handleAddBooking, content },
    admin: { 
        content, setContent, 
        events, onAddEvent: handleAddEvent, onUpdateEvent: handleUpdateEvent, onDeleteEvent: handleDeleteEvent,
        bookings, onAddBooking: handleAddBooking, onUpdateBookingStatus: handleUpdateBookingStatus,
        transactions, onAddTransaction: handleAddTransaction,
        subscribers, onAddSubscriber: handleAddSubscriber, onUpdateSubscriber: handleUpdateSubscriber, onDeleteSubscriber: handleDeleteSubscriber,
        onUpdateContract: handleUpdateContract,
        setShowMainHeader, ref: adminHubRef 
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {showMainHeader && <Header activeHub={activeHub} setActiveHub={handleSetActiveHub} />}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {ActiveComponent && <ActiveComponent {...componentProps[activeHub]} />}
        </div>
      </main>
    </div>
  );
}


export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  )
}
