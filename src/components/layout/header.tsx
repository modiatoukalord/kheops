"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Pyramid, LogIn } from "lucide-react";

interface HeaderProps {
  activeHub: string;
  setActiveHub: (hub: "culture" | "studio" | "wear" | "admin") => void;
}

export default function Header({ activeHub, setActiveHub }: HeaderProps) {
  const { toast } = useToast();
  const navItems = [
    { id: "culture", label: "Culture Hub" },
    { id: "studio", label: "Studio" },
    { id: "wear", label: "Wear" },
    { id: "admin", label: "Admin" },
  ];

  const handleLoginClick = () => {
    toast({
      title: "Fonctionnalité à venir",
      description: "La connexion utilisateur n'est pas encore disponible.",
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto px-4">
        <div className="mr-4 flex items-center">
          <Pyramid className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold font-headline tracking-wider">
            KHEOPS
          </span>
        </div>

        <nav className="flex items-center space-x-2 lg:space-x-4 mx-auto">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeHub === item.id ? "secondary" : "ghost"}
              onClick={() => setActiveHub(item.id as "culture" | "studio" | "wear" | "admin")}
              className={`font-semibold transition-all duration-200 ${activeHub === item.id ? "text-primary scale-105" : ""}`}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
            onClick={handleLoginClick}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Connexion
          </Button>
        </div>
      </div>
    </header>
  );
}
