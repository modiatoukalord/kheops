
"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import Header from "@/components/layout/header";
import CultureHub from "@/components/hubs/culture-hub";
import StudioHub from "@/components/hubs/studio-hub";
import WearHub from "@/components/hubs/wear-hub";
import AdminHub from "@/components/hubs/admin-hub";
import { initialContent, Content } from "@/components/admin/content-management";
import { initialEvents, AppEvent } from "@/components/admin/event-management";

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

  const ActiveComponent = hubComponents[activeHub];

  const componentProps: { [key: string]: any } = {
    culture: { content, events },
    admin: { content, setContent, events, setEvents },
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

    