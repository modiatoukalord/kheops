
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Globe, Palette, Phone, Mail, Link, KeyRound, ShieldAlert } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SiteSettings() {
  const { toast } = useToast();

  const handleSave = (section: string) => {
    toast({
      title: "Paramètres Enregistrés",
      description: `Les paramètres de la section "${section}" ont été mis à jour.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* General Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
             <div className="flex-shrink-0 bg-blue-500/20 text-blue-500 p-3 rounded-full">
                <Globe className="h-6 w-6" />
             </div>
             <div>
                <CardTitle>Informations Générales</CardTitle>
                <CardDescription>Mettez à jour le titre et le slogan de votre site.</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site-title">Titre du Site</Label>
              <Input id="site-title" defaultValue="KHEOPS Numérique" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-tagline">Slogan</Label>
              <Input id="site-tagline" defaultValue="Écosystème Culturel & Créatif" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 justify-end">
            <Button onClick={() => handleSave("Informations Générales")}>Enregistrer</Button>
        </CardFooter>
      </Card>

      {/* Appearance Card */}
      <Card>
        <CardHeader>
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-purple-500/20 text-purple-500 p-3 rounded-full">
                    <Palette className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle>Apparence et Thème</CardTitle>
                    <CardDescription>Personnalisez les couleurs de votre plateforme.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                <Label htmlFor="primary-color">Couleur Primaire (Or)</Label>
                <div className="relative">
                    <Input id="primary-color" type="text" defaultValue="#FFD700" className="pl-10" />
                    <Input type="color" defaultValue="#FFD700" className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 border-0 bg-transparent cursor-pointer" />
                </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="background-color">Fond (Gris Foncé)</Label>
                 <div className="relative">
                    <Input id="background-color" type="text" defaultValue="#333333" className="pl-10" />
                    <Input type="color" defaultValue="#333333" className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 border-0 bg-transparent cursor-pointer" />
                </div>
                </div>
                <div className="space-y-2">
                <Label htmlFor="accent-color">Accent (Turquoise)</Label>
                 <div className="relative">
                    <Input id="accent-color" type="text" defaultValue="#40E0D0" className="pl-10" />
                    <Input type="color" defaultValue="#40E0D0" className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 border-0 bg-transparent cursor-pointer" />
                </div>
                </div>
                <Button variant="outline">Réinitialiser</Button>
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 justify-end">
            <Button onClick={() => handleSave("Apparence et Thème")}>Enregistrer</Button>
        </CardFooter>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact & Socials Card */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                     <div className="flex-shrink-0 bg-green-500/20 text-green-500 p-3 rounded-full">
                        <Link className="h-6 w-6" />
                     </div>
                     <div>
                        <CardTitle>Coordonnées et Réseaux</CardTitle>
                        <CardDescription>Gérez les informations de contact et les liens sociaux.</CardDescription>
                     </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <Input type="email" placeholder="Email de contact" defaultValue="contact@kheops.com" />
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <Input type="tel" placeholder="Téléphone de contact" defaultValue="+242 06 123 45 67" />
                </div>
                <Separator className="my-4"/>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-24">Facebook</span>
                    <Input placeholder="Lien vers la page Facebook" defaultValue="https://facebook.com/kheops"/>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-24">Instagram</span>
                    <Input placeholder="Lien vers le profil Instagram" defaultValue="https://instagram.com/kheops_numerique"/>
                </div>
                 <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-24">X / Twitter</span>
                    <Input placeholder="Lien vers le profil X" defaultValue="https://x.com/kheops"/>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 justify-end">
                <Button onClick={() => handleSave("Coordonnées et Réseaux")}>Enregistrer</Button>
            </CardFooter>
        </Card>

        {/* Advanced Settings Card */}
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                     <div className="flex-shrink-0 bg-red-500/20 text-red-500 p-3 rounded-full">
                        <ShieldAlert className="h-6 w-6" />
                     </div>
                     <div>
                        <CardTitle>Paramètres Avancés</CardTitle>
                        <CardDescription>Gérez les options pour les administrateurs.</CardDescription>
                     </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="api-key-google">Clé API Google Maps</Label>
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-muted-foreground"/>
                    <Input id="api-key-google" type="password" placeholder="Entrez votre clé API" />
                  </div>
                </div>
                <Separator />
                <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <Label className="text-base">Mode Maintenance</Label>
                    <p className="text-sm text-muted-foreground">
                      Désactive l'accès public au site.
                    </p>
                  </div>
                  <Switch aria-label="Mode Maintenance" />
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 justify-end">
                <Button variant="destructive" onClick={() => handleSave("Paramètres Avancés")}>Enregistrer</Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
