"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function AdminHub() {
  return (
    <div className="space-y-12">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary font-headline tracking-wider">PANNEAU D'ADMINISTRATION</h1>
        <p className="text-muted-foreground text-lg">Gestion et administration de la plateforme KHEOPS.</p>
      </header>

      <section>
        <div className="flex items-center gap-4 mb-6">
          <Shield className="w-8 h-8 text-accent" />
          <h2 className="text-3xl font-semibold font-headline">Accès Restreint</h2>
        </div>
        <Card className="bg-card border-border/50">
            <CardHeader>
                <CardTitle>Zone sécurisée</CardTitle>
                <CardDescription>Cette section est réservée aux administrateurs.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Contenu et fonctionnalités d'administration à venir.</p>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
