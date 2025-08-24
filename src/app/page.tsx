
"use client";

import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import Header from "@/components/layout/header";
import CultureHub from "@/components/hubs/culture-hub";
import StudioHub from "@/components/hubs/studio-hub";
import WearHub from "@/components/hubs/wear-hub";
import AdminHub from "@/components/hubs/admin-hub";
import { initialContent, Content } from "@/components/admin/content-management";
import { initialEvents, AppEvent } from "@/components/admin/event-management";
import { Booking, initialBookings } from "@/components/admin/booking-schedule";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from "firebase/firestore";


type Hubs = {
  [key: string]: ComponentType<any>;
};

const hubComponents: Hubs = {
  culture: CultureHub,
  studio: StudioHub,
  wear: WearHub,
  admin: AdminHub,
};

export default function Home() {
  const [activeHub, setActiveHub] = useState("culture");
  const [content, setContent] = useState<Content[]>(initialContent);
  const [events, setEvents] = useState<AppEvent[]>(initialEvents);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const q = query(collection(db, "bookings"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate(),
            // Ensure tracks also have dates converted
            tracks: data.tracks?.map((track: any) => ({
              ...track,
              date: (track.date as Timestamp).toDate(),
            }))
          } as Booking;
        });
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings: ", error);
        // Fallback to initial data on error
        setBookings(initialBookings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);


  const handleAddBooking = async (newBookingData: Omit<Booking, 'id' | 'status'>) => {
    try {
        const bookingPayload: Omit<Booking, 'id'> = {
            ...newBookingData,
            status: "En attente" as const,
        };

        const docRef = await addDoc(collection(db, "bookings"), bookingPayload);
        
        const newBooking: Booking = {
            ...bookingPayload,
            id: docRef.id,
        };
        
        setBookings(prev => [newBooking, ...prev]);

    } catch (error) {
        console.error("Error adding document: ", error);
    }
  };


  const ActiveComponent = hubComponents[activeHub];

  const componentProps: { [key: string]: any } = {
    culture: { content, events },
    studio: { bookings, onAddBooking: handleAddBooking },
    admin: { content, setContent, events, setEvents, bookings, setBookings },
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header activeHub={activeHub} setActiveHub={setActiveHub} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {ActiveComponent && <ActiveComponent {...componentProps[activeHub]} />}
        </div>
      </main>
    </div>
  );
}
