
"use client";

import { Button } from "@/components/ui/button";
import { Home, Briefcase, Shirt, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeHub: string;
  setActiveHub: (hub: "culture" | "studio" | "wear" | "admin") => void;
}

const navItems = [
  { id: "culture", label: "Culture", icon: Home },
  { id: "studio", label: "Studio", icon: Briefcase },
  { id: "wear", label: "Wear", icon: Shirt },
  { id: "admin", label: "Admin", icon: Shield },
];

export default function BottomNav({ activeHub, setActiveHub }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 z-50 md:hidden">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeHub === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setActiveHub(item.id as "culture" | "studio" | "wear" | "admin")}
              className={cn(
                "inline-flex flex-col items-center justify-center px-5 rounded-none h-full",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
