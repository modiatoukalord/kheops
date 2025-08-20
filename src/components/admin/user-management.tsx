"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Users, CreditCard, Activity, DollarSign, Filter } from "lucide-react";
import Image from "next/image";

const subscribers = [
  {
    id: "user-001",
    name: "Amina Dubois",
    email: "amina.d@email.com",
    avatar: "https://placehold.co/40x40.png",
    hint: "woman portrait",
    plan: "Membre KHEOPS",
    status: "Actif",
    startDate: "15-07-2024",
    amount: "5 000 FCFA",
  },
  {
    id: "user-002",
    name: "Binta Traoré",
    email: "b.traore@email.com",
    avatar: "https://placehold.co/40x40.png",
    hint: "woman face",
    plan: "Membre KHEOPS",
    status: "Actif",
    startDate: "12-07-2024",
    amount: "5 000 FCFA",
  },
  {
    id: "user-003",
    name: "Mamadou Sow",
    email: "msow@email.com",
    avatar: "https://placehold.co/40x40.png",
    hint: "man portrait",
    plan: "Premium",
    status: "Annulé",
    startDate: "01-06-2024",
    amount: "15 000 FCFA",
  },
  {
    id: "user-004",
    name: "Fatou N'diaye",
    email: "fatou.ndiaye@email.com",
    avatar: "https://placehold.co/40x40.png",
    hint: "woman smiling",
    plan: "Premium",
    status: "Actif",
    startDate: "28-06-2024",
    amount: "15 000 FCFA",
  },
  {
    id: "user-005",
    name: "Jean-Pierre Diallo",
    email: "jp.diallo@email.com",
    avatar: "https://placehold.co/40x40.png",
    hint: "man face",
    plan: "Membre KHEOPS",
    status: "En attente",
    startDate: "20-07-2024",
    amount: "5 000 FCFA",
  },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
  "Actif": "default",
  "En attente": "secondary",
  "Annulé": "destructive",
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { title: "Abonnés Totaux", value: "152", icon: Users },
    { title: "Abonnés Actifs", value: "128", icon: CreditCard },
    { title: "Nouveaux / mois", value: "12", icon: Activity },
    { title: "Revenu Mensuel", value: "640 000 FCFA", icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle>Liste des Abonnés</CardTitle>
                <CardDescription>Consultez et gérez les abonnements des utilisateurs.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Rechercher par nom ou email..." 
                        className="pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrer
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Avatar</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead className="hidden sm:table-cell">Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell>
                      <Image
                        src={subscriber.avatar}
                        alt={subscriber.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                        data-ai-hint={subscriber.hint}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{subscriber.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{subscriber.email}</TableCell>
                    <TableCell>
                        <div className="font-medium">{subscriber.plan}</div>
                        <div className="text-xs text-muted-foreground">{subscriber.amount}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={statusVariant[subscriber.status] || "default"}>
                        {subscriber.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{subscriber.startDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                          <DropdownMenuItem>Modifier l'abonnement</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">Annuler l'abonnement</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
