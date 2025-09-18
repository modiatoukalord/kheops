
"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, Filter, Phone, User, Award, DollarSign, Star, TrendingUp, Gem, UserCheck, UserX, Users, Gift, Ticket, Percent, PlusCircle, StarIcon } from "lucide-react";
import { format, isValid, parse, isAfter } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import UserProfile from "./user-profile";
import { KHEOPS_MEMBER_FEE } from "@/lib/pricing";
import { Subscriber } from "./user-management";
import { ClientActivity } from "./activity-log";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UserManagement from "./user-management";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Transaction } from "./financial-management";


export type Reward = {
    id: string;
    clientId: string;
    clientName: string;
    type: 'Réduction' | 'Entrée gratuite' | 'Points bonus';
    grantedAt: Date;
    status: 'Utilisé' | 'Non utilisé';
};

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
    rewards: Reward[];
};

export const tierConfig = {
    Bronze: { icon: Star, color: "text-yellow-600" },
    Argent: { icon: Star, color: "text-gray-400" },
    Or: { icon: Award, color: "text-yellow-500" },
    Platine: { icon: TrendingUp, color: "text-cyan-400" },
    Diamant: { icon: Gem, color: "text-purple-400" },
};

interface ClientManagementProps {
  subscribers: Subscriber[];
  activities: ClientActivity[];
  rewards: Reward[];
  onGrantReward: (reward: Omit<Reward, 'id' | 'grantedAt' | 'status'>) => Promise<void>;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
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
    rewards = [],
    onGrantReward,
    onAddTransaction,
    ...userManagementProps
}: ClientManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { toast } = useToast();
  const [isReductionDialogOpen, setReductionDialogOpen] = useState(false);
  const [clientForReduction, setClientForReduction] = useState<Client | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [reductionAmount, setReductionAmount] = useState(0);
   const [loyaltyTiers, setLoyaltyTiers] = useState({
    Argent: 5,
    Or: 10,
    Platine: 25,
    Diamant: 50,
  });

  const clients = useMemo<Client[]>(() => {
    const clientMap = new Map<string, Client>();

    // Process subscribers first
    subscribers.forEach(sub => {
        const startDate = parse(sub.startDate, 'dd-MM-yyyy', new Date());
        const endDate = parse(sub.endDate, 'dd-MM-yyyy', new Date());

        const client: Client = {
            id: sub.id,
            name: sub.name,
            phone: sub.phone,
            type: "Abonné",
            firstSeen: isValid(startDate) ? startDate : new Date(),
            lastSeen: isValid(endDate) ? endDate : new Date(),
            totalSpent: parseFloat(sub.amount.replace(/[^\d,]/g, '').replace(',', '.')),
            activityCount: 1, // At least one activity (the subscription itself)
            loyaltyPoints: 0,
            loyaltyTier: "Bronze",
            subscriberInfo: sub,
            rewards: [],
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
            if (isAfter(act.date, existingClient.lastSeen)) {
                existingClient.lastSeen = act.date;
            }
        } else {
            const newClient: Client = {
                id: act.id, // This might not be unique if a client has multiple activities
                name: act.clientName,
                phone: act.phone || 'N/A',
                type: "Client Ponctuel",
                firstSeen: act.date,
                lastSeen: act.date,
                totalSpent: totalAmount,
                activityCount: 1,
                loyaltyPoints: 0,
                loyaltyTier: "Bronze",
                rewards: [],
            };
            clientMap.set(phoneKey, newClient);
        }
    });

    const allClients = Array.from(clientMap.values());
    
    // Calculate loyalty
    allClients.forEach(client => {
        client.loyaltyPoints = client.activityCount;

        if (client.loyaltyPoints > loyaltyTiers.Diamant) {
            client.loyaltyTier = "Diamant";
        } else if (client.loyaltyPoints > loyaltyTiers.Platine) {
            client.loyaltyTier = "Platine";
        } else if (client.loyaltyPoints > loyaltyTiers.Or) {
            client.loyaltyTier = "Or";
        } else if (client.loyaltyPoints > loyaltyTiers.Argent) {
            client.loyaltyTier = "Argent";
        } else {
            client.loyaltyTier = "Bronze";
        }
        
        // Associate rewards
        client.rewards = rewards.filter(r => r.clientId === client.id);
    });
    
    return allClients.sort((a,b) => b.lastSeen.getTime() - a.lastSeen.getTime());

  }, [subscribers, activities, rewards, loyaltyTiers]);


  const filteredClients = clients.filter(client => {
    return client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const totalClients = clients.length;
  const totalSubscribers = subscribers.length;

  const handleGrantReward = async (client: Client, rewardType: Reward['type']) => {
    try {
        await onGrantReward({
            clientId: client.id,
            clientName: client.name,
            type: rewardType,
        });
        toast({
          title: "Récompense Accordée !",
          description: `${rewardType} a été accordé(e) à ${client.name}.`,
        });
    } catch (error) {
        console.error("Error granting reward: ", error);
        toast({ title: "Erreur", description: "Impossible d'accorder la récompense.", variant: "destructive" });
    }
  };
  
    const handleOpenReductionDialog = (client: Client) => {
        setClientForReduction(client);
        setReductionDialogOpen(true);
    };

    const handleReductionSubmit = async () => {
        if (!clientForReduction || reductionAmount <= 0 || selectedActivities.length === 0) {
            toast({ title: "Erreur", description: "Veuillez sélectionner au moins une activité et entrer un montant valide.", variant: "destructive" });
            return;
        }

        const reductionTransaction: Omit<Transaction, 'id'> = {
            date: format(new Date(), "yyyy-MM-dd"),
            description: `Réduction accordée à ${clientForReduction.name} sur activité(s) (${selectedActivities.join(', ').substring(0, 20)}...)`,
            type: "Dépense",
            category: "Autre", // Or a specific "Discount" category
            amount: -reductionAmount,
            status: "Complété",
        };

        onAddTransaction(reductionTransaction);
        
        await handleGrantReward(clientForReduction, "Réduction");

        toast({
            title: "Réduction Appliquée",
            description: `Une réduction de ${reductionAmount.toLocaleString('fr-FR')} FCFA a été enregistrée pour ${clientForReduction.name}.`,
        });

        setReductionDialogOpen(false);
        setClientForReduction(null);
        setSelectedActivities([]);
        setReductionAmount(0);
    };


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

  const clientActivities = activities.filter(act => act.clientName === clientForReduction?.name || act.phone === clientForReduction?.phone);

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
                <p className="text-xs text-muted-foreground">{totalClients > 0 ? ((totalSubscribers/totalClients) * 100).toFixed(1) : 0}% des clients</p>
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
                            <TableHead>Type</TableHead>
                            <TableHead>Dépenses Totales</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Niveau de Fidélité</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.map((client) => {
                                const tierInfo = tierConfig[client.loyaltyTier];
                                return(
                                <TableRow key={client.id}>
                                    <TableCell>
                                        <div className="font-medium">{client.name}</div>
                                        <div className="text-xs text-muted-foreground">{client.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={client.type === "Abonné" ? "default" : "outline"}>
                                            {client.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold">{client.totalSpent.toLocaleString('fr-FR')} FCFA</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 font-semibold">
                                            <StarIcon className="h-4 w-4 text-yellow-400" />
                                            {client.loyaltyPoints}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <tierInfo.icon className={`h-4 w-4 ${tierInfo.color}`}/>
                                            <span>{client.loyaltyTier}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                       <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="icon">
                                                  <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => setSelectedClient(client)}>
                                                  <User className="mr-2 h-4 w-4" />
                                                  Voir le profil
                                              </DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuSub>
                                                  <DropdownMenuSubTrigger>
                                                      <Gift className="mr-2 h-4 w-4" />
                                                      Accorder une récompense
                                                  </DropdownMenuSubTrigger>
                                                  <DropdownMenuPortal>
                                                      <DropdownMenuSubContent>
                                                          <DropdownMenuItem onClick={() => handleOpenReductionDialog(client)}>
                                                              <Percent className="mr-2 h-4 w-4" />
                                                              Réduction (points)
                                                          </DropdownMenuItem>
                                                          <DropdownMenuItem onClick={() => handleGrantReward(client, "Entrée gratuite")}>
                                                              <Ticket className="mr-2 h-4 w-4" />
                                                              Entrée gratuite
                                                          </DropdownMenuItem>
                                                           <DropdownMenuItem onClick={() => handleGrantReward(client, "Points bonus")}>
                                                              <PlusCircle className="mr-2 h-4 w-4" />
                                                              Points bonus
                                                          </DropdownMenuItem>
                                                      </DropdownMenuSubContent>
                                                  </DropdownMenuPortal>
                                              </DropdownMenuSub>
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>
             <TabsContent value="subscribers">
                <UserManagement subscribers={subscribers} {...userManagementProps} />
            </TabsContent>
        </CardContent>
      </Card>

        <Dialog open={isReductionDialogOpen} onOpenChange={setReductionDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Accorder une réduction à {clientForReduction?.name}</DialogTitle>
                    <DialogDescription>
                        Sélectionnez les activités concernées et entrez le montant de la réduction.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-2">
                        <Label>Activités du client</Label>
                        <div className="space-y-2 rounded-md border p-2">
                            {clientActivities.length > 0 ? clientActivities.map(act => (
                                <div key={act.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`act-${act.id}`}
                                        onCheckedChange={(checked) => {
                                            setSelectedActivities(prev => checked ? [...prev, act.id] : prev.filter(id => id !== act.id))
                                        }}
                                    />
                                    <Label htmlFor={`act-${act.id}`} className="flex-grow cursor-pointer">
                                        <div className="flex justify-between">
                                            <span>{act.description}</span>
                                            <span className="font-mono text-xs">{act.totalAmount.toLocaleString('fr-FR')} FCFA</span>
                                        </div>
                                         <p className="text-xs text-muted-foreground">{format(act.date, "d MMM yyyy", { locale: fr })}</p>
                                    </Label>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center p-4">Aucune activité trouvée pour ce client.</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reduction-amount">Montant de la réduction (FCFA)</Label>
                        <Input 
                            id="reduction-amount" 
                            type="number" 
                            value={reductionAmount}
                            onChange={(e) => setReductionAmount(Number(e.target.value))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setReductionDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleReductionSubmit}>Appliquer la réduction</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </Tabs>
  );
}

    