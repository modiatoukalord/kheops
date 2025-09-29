
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Pyramid, LogIn, LogOut, ShoppingCart, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { logout } from "@/app/lib/auth-actions";
import type { Employee } from "../admin/human-resources-management";

interface HeaderProps {
  activeHub: string;
  setActiveHub: (hub: "culture" | "studio" | "wear" | "admin") => void;
  user: Employee | null;
  cartCount: number;
  onCartClick: () => void;
}

export default function Header({ activeHub, setActiveHub, user, cartCount, onCartClick }: HeaderProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navItems = [
    { id: "culture", label: "Culture Hub" },
    { id: "studio", label: "Studio" },
    { id: "wear", label: "Wear" },
    { id: "admin", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto px-4">
        <div className="mr-4 flex items-center">
          <Pyramid className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold font-headline tracking-wider">
            KHEOPS
          </span>
        </div>

        {!isMobile && (
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
        )}


        <div className="flex items-center ml-auto gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onCartClick}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0">
                {cartCount}
              </Badge>
            )}
          </Button>
          {user ? (
            <form action={logout}>
              <Button
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </Button>
            </form>
          ) : (
            <Button
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => setActiveHub('admin')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Connexion
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
