"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AtSign, Calendar, Edit, Phone, ShieldCheck, User, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import type { Subscriber } from "./user-management";

interface UserProfileProps {
  user: Subscriber;
  onBack: () => void;
}

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
  "Actif": "default",
  "En attente": "secondary",
  "Annulé": "destructive",
};

export default function UserProfile({ user, onBack }: UserProfileProps) {
  const qrValue = JSON.stringify({
    userId: user.id,
    name: user.name,
    plan: user.plan,
    endDate: user.endDate,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Profil de l'Abonné</h1>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Image
                src={user.avatar}
                alt={user.name}
                width={80}
                height={80}
                className="rounded-full border-4 border-primary"
                data-ai-hint={user.hint}
              />
              <div>
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  ID Utilisateur: {user.id}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Contact:</span>
                    <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <AtSign className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{user.name.toLowerCase().replace(" ", ".")}@email.com</span>
                </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-accent" /> Détails de l'Abonnement</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
                <div><span className="font-semibold">Plan:</span> {user.plan}</div>
                <div><span className="font-semibold">Montant:</span> {user.amount}</div>
                <div className="flex items-center gap-2"><span className="font-semibold">Statut:</span> <Badge variant={statusVariant[user.status]}>{user.status}</Badge></div>
                <div><span className="font-semibold">Début:</span> {user.startDate}</div>
                <div><span className="font-semibold">Fin:</span> {user.endDate}</div>
            </CardContent>
          </Card>
        </div>
        <Card className="flex flex-col items-center justify-center p-6">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center gap-2 justify-center"><QrCode className="w-6 h-6 text-accent"/> QR Code d'Abonnement</CardTitle>
                <CardDescription>Scannez pour vérifier la validité de l'abonnement.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 bg-white rounded-lg">
                <QRCode value={qrValue} size={160} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
