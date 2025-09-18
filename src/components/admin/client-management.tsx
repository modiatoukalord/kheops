
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, Filter, Phone, User, Award, DollarSign, Star, TrendingUp, Gem, UserCheck, UserX } from "lucide-react";
import { format, isValid } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import UserProfile from "./user-profile";
import { KHEOPS_MEMBER_FEE } from "@/lib/pricing";
import { Subscriber } from "./user-management";
import { ClientActivity } from "./activity-log";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UserManagement from "./user-management";

export type Client = {
    id: string;
    name: string;
    phone: string;
    type: "Abonné" | "Client Ponctuel";
    firstSeen: Date;
    lastSeen: Date;
    totalSpent: number;
    activityCount: number;
    loyaltyTier: "Bronze" | "Argent" | "Or" | "Platine" | "Diamant";
    loyaltyPoints: number;
    subscriberInfo?: Subscriber;
};

const tierConfig = {
    Bronze: { icon: Star, color: "text-yellow-600" },
    Argent: { icon: Star, color: "text-gray-400" },
    Or: { icon: Award, color: "text-yellow-500" },
    Platine: { icon: TrendingUp, color: "text-cyan-400" },
    Diamant: { icon: Gem, color: "text-purple-400" },
};

interface ClientManagementProps {
  subscribers: Subscriber[];
  activities: ClientActivity[];
  // Re-use subscriber functions
  onAddSubscriber: (newSubscriber: Omit<Subscriber, 'id'>) => void;
  onUpdateSubscriber: (id: string, data: Partial<Omit<Subscriber, 'id'>>) => void;
  onDeleteSubscriber: (id: string) => void;
  onValidateSubscription: (subscriber: Subscriber) => void;
  onRenewSubscriber: (subscriberToRenew: Subscriber, durationMonths: number) => void;
}


export default function ClientManagement({ 
    subscribers = [], 
    activities = [],
    ...userManagementProps
}: ClientManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const clients = useMemo<Client[]>(() => {
    const clientMap = new Map<string, Client>();

    // Process subscribers first
    subscribers.forEach(sub => {
        const client: Client = {
            id: sub.id,
            name: sub.name,
            phone: sub.phone,
            type: "Abonné",
            firstSeen: new Date(sub.startDate.split('-').reverse().join('-')),
            lastSeen: new Date(sub.endDate.split('-').reverse().join('-')),
            totalSpent: parseFloat(sub.amount.replace(/[^\d,]/g, '').replace(',', '.')),
            activityCount: 1, // At least one activity (the subscription itself)
            loyaltyPoints: 0,
            loyaltyTier: "Bronze",
            subscriberInfo: sub,
        };
        clientMap.set(sub.phone, client); // Use phone as a key for merging
    });

    // Process activities and merge with existing clients or create new ones
    activities.forEach(act => {
        const phoneKey = act.phone || act.clientName; // Use phone, fallback to name
        if (!phoneKey) return;

        const totalAmount = act.paymentType === 'Direct' ? act.totalAmount : (act.paidAmount || 0);

        if (clientMap.has(phoneKey)) {
            const existingClient = clientMap.get(phoneKey)!;
            existingClient.totalSpent += totalAmount;
            existingClient.activityCount++;
            if (act.date > existingClient.lastSeen) {
                existingClient.lastSeen = act.date;
            }
        } else {
            const newClient: Client = {
                id: act.id,
                name: act.clientName,
                phone: act.phone || 'N/A',
                type: "Client Ponctuel",
                firstSeen: act.date,
                lastSeen: act.date,
                totalSpent: totalAmount,
                activityCount: 1,
                loyaltyPoints: 0,
                loyaltyTier: "Bronze",
            };
            clientMap.set(phoneKey, newClient);
        }
    });

    const allClients = Array.from(clientMap.values());
    
    // Calculate loyalty
    allClients.forEach(client => {
        if (client.totalSpent > 500000) {
            client.loyaltyTier = "Diamant";
            client.loyaltyPoints = Math.floor(client.totalSpent / 100);
        } else if (client.totalSpent > 250000) {
            client.loyaltyTier = "Platine";
            client.loyaltyPoints = Math.floor(client.totalSpent / 150);
        } else if (client.totalSpent > 100000) {
            client.loyaltyTier = "Or";
            client.loyaltyPoints = Math.floor(client.totalSpent / 200);
        } else if (client.totalSpent > 50000) {
            client.loyaltyTier = "Argent";
            client.loyaltyPoints = Math.floor(client.totalSpent / 250);
        } else {
            client.loyaltyTier = "Bronze";
            client.loyaltyPoints = Math.floor(client.totalSpent / 300);
        }
    });
    
    return allClients.sort((a,b) => b.lastSeen.getTime() - a.lastSeen.getTime());

  }, [subscribers, activities]);


  const filteredClients = clients.filter(client => {
    return client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const totalClients = clients.length;
  const totalSubscribers = subscribers.length;
  
  if (selectedClient) {
      const sub = subscribers.find(s => s.phone === selectedClient.phone);
      if(sub) {
        return <UserProfile user={sub} onBack={() => setSelectedClient(null)} />;
      } else {
          // Here you could show a simplified profile for non-subscribers
          alert(`Profil détaillé non disponible pour les clients non-abonnés pour le moment.`);
          setSelectedClient(null);
      }
  }

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clients Uniques</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground">Nombre total de clients enregistrés</p>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Abonnés Actifs</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalSubscribers}</div>
                <p className="text-xs text-muted-foreground">{((totalSubscribers/totalClients) * 100).toFixed(1)}% des clients</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <CardTitle>Gestion des Clients</CardTitle>
                    <CardDescription>Vue unifiée des abonnés et des clients ponctuels.</CardDescription>
                </div>
                <div className="flex w-full md:w-auto items-center gap-4">
                     <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Rechercher un client..." 
                            className="pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <TabsList>
                        <TabsTrigger value="all">Tous les clients</TabsTrigger>
                        <TabsTrigger value="subscribers">Abonnements</TabsTrigger>
                    </TabsList>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <TabsContent value="all">
                 <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Dépenses Totales</TableHead>
                            <TableHead>Niveau de Fidélité</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.map((client) => {
                                const tierInfo = tierConfig[client.loyaltyTier];
                                return(
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>{client.phone}</TableCell>
                                    <TableCell>
                                        <Badge variant={client.type === "Abonné" ? "default" : "outline"}>
                                            {client.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold">{client.totalSpent.toLocaleString('fr-FR')} FCFA</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <tierInfo.icon className={`h-4 w-4 ${tierInfo.color}`}/>
                                            <span>{client.loyaltyTier}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedClient(client)}>
                                            Voir le profil
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>
             <TabsContent value="subscribers">
                <UserManagement {...userManagementProps} />
            </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  );
}
