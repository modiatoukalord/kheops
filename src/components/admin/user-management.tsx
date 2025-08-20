
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Search, Users, CreditCard, Activity, DollarSign, Filter, Phone, CalendarOff, PlusCircle, Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { addMonths, parse, format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import UserProfile from "./user-profile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";


const KHEOPS_MEMBER_FEE = 5000;
const PREMIUM_FEE = 15000;

const subscribersData = [
  {
    id: "user-001",
    name: "Amina Dubois",
    phone: "+242 06 123 4567",
    avatar: "https://placehold.co/40x40.png",
    hint: "woman portrait",
    plan: "Membre KHEOPS",
    status: "Actif" as "Actif" | "En attente" | "Annulé",
    startDate: "15-07-2024",
    amount: "5 000 FCFA",
  },
  {
    id: "user-002",
    name: "Binta Traoré",
    phone: "+242 05 987 6543",
    avatar: "https://placehold.co/40x40.png",
    hint: "woman face",
    plan: "Membre KHEOPS",
    status: "Actif" as "Actif" | "En attente" | "Annulé",
    startDate: "12-07-2024",
    amount: "5 000 FCFA",
  },
  {
    id: "user-003",
    name: "Mamadou Sow",
    phone: "+242 06 111 2233",
    avatar: "https://placehold.co/40x40.png",
    hint: "man portrait",
    plan: "Premium",
    status: "Annulé" as "Actif" | "En attente" | "Annulé",
    startDate: "01-06-2024",
    amount: "15 000 FCFA",
  },
  {
    id: "user-004",
    name: "Fatou N'diaye",
    phone: "+242 05 444 5566",
    avatar: "https://placehold.co/40x40.png",
    hint: "woman smiling",
    plan: "Premium",
    status: "Actif" as "Actif" | "En attente" | "Annulé",
    startDate: "28-06-2024",
    amount: "15 000 FCFA",
  },
  {
    id: "user-005",
    name: "Jean-Pierre Diallo",
    phone: "+242 06 777 8899",
    avatar: "https://placehold.co/40x40.png",
    hint: "man face",
    plan: "Membre KHEOPS",
    status: "En attente" as "Actif" | "En attente" | "Annulé",
    startDate: "20-07-2024",
    amount: "5 000 FCFA",
  },
];

const getEndDate = (startDate: string, durationMonths = 1) => {
  try {
    const date = parse(startDate, 'dd-MM-yyyy', new Date());
    const endDate = addMonths(date, durationMonths);
    return endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  } catch (error) {
    return "N/A";
  }
};


const initialSubscribers = subscribersData.map(s => ({
  ...s,
  endDate: s.status === "Annulé" ? "N/A" : getEndDate(s.startDate, s.plan === "Premium" ? 1 : 1),
}));

export type Subscriber = (typeof initialSubscribers)[0];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
  "Actif": "default",
  "En attente": "secondary",
  "Annulé": "destructive",
};

export default function UserManagement() {
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [selectedSubscriberId, setSelectedSubscriberId] = useState<string>("");
  const { toast } = useToast();
  const [comboboxOpen, setComboboxOpen] = useState(false);


  const handleSubscriptionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const durationMonths = parseInt(formData.get("duration") as string, 10);
    const subscriberIdToUpdate = selectedSubscriberId;
    
    const today = new Date();
    const startDate = format(today, 'dd-MM-yyyy');
    
    const amount = (KHEOPS_MEMBER_FEE) * durationMonths;

    if (subscriberIdToUpdate && subscriberIdToUpdate !== 'new') {
        // Handle renewal
        setSubscribers(prev => 
            prev.map(sub => 
                sub.id === subscriberIdToUpdate
                ? {
                    ...sub,
                    plan: 'Abonnement KHEOPS',
                    status: 'Actif' as 'Actif',
                    startDate: startDate,
                    amount: `${amount.toLocaleString('fr-FR')} FCFA`,
                    endDate: getEndDate(startDate, durationMonths),
                  }
                : sub
            )
        );
        const renewedSubscriber = subscribers.find(s => s.id === subscriberIdToUpdate);
        toast({
            title: "Abonnement Renouvelé",
            description: `L'abonnement de ${renewedSubscriber?.name} a été renouvelé.`,
        });

    } else {
        // Handle new subscriber
        const newSubscriber = {
            id: `user-${Date.now()}`,
            name,
            phone,
            avatar: "https://placehold.co/40x40.png",
            hint: "person face",
            plan: 'Abonnement KHEOPS',
            status: 'Actif' as 'Actif',
            startDate: startDate,
            amount: `${amount.toLocaleString('fr-FR')} FCFA`,
            endDate: getEndDate(startDate, durationMonths),
        };
        setSubscribers(prev => [newSubscriber, ...prev]);
        toast({
            title: "Abonné ajouté",
            description: `${name} a été ajouté à la liste des abonnés.`,
        });
    }

    setDialogOpen(false);
    setSelectedSubscriberId("");
  };
  
  const handleAction = (action: string, subscriberId: string) => {
    const subscriber = subscribers.find(s => s.id === subscriberId);
    if (!subscriber) return;

    let title = "";
    let description = "";

    switch (action) {
      case "view":
        setSelectedSubscriber(subscriber);
        break;
      case "edit":
        title = "Modification de l'Abonnement";
        description = `Le formulaire de modification pour ${subscriber.name} sera bientôt disponible.`;
        toast({ title, description });
        break;
      case "cancel":
        setSubscribers(subscribers.map(s => 
          s.id === subscriberId ? { ...s, status: "Annulé", endDate: "N/A" } : s
        ));
        title = "Abonnement Annulé";
        description = `L'abonnement de ${subscriber.name} a été annulé.`;
        toast({ title, description, variant: "destructive" });
        break;
      default:
        return;
    }
  };
  
  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscriber.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { title: "Abonnés Totaux", value: "152", icon: Users },
    { title: "Abonnés Actifs", value: "128", icon: CreditCard },
    { title: "Nouveaux / mois", value: "12", icon: Activity },
    { title: "Revenu Mensuel", value: "640 000 FCFA", icon: DollarSign },
  ];
  
  if (selectedSubscriber) {
    return <UserProfile user={selectedSubscriber} onBack={() => setSelectedSubscriber(null)} />;
  }

  const subscriberToRenew = subscribers.find(s => s.id === selectedSubscriberId);


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
                        placeholder="Rechercher par nom ou contact..." 
                        className="pl-10 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrer
                </Button>
                 <Dialog open={isDialogOpen} onOpenChange={(isOpen) => { setDialogOpen(isOpen); if (!isOpen) setSelectedSubscriberId("");}}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter ou Renouveler
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleSubscriptionSubmit}>
                            <DialogHeader>
                                <DialogTitle>Ajouter ou Renouveler un Abonnement</DialogTitle>
                                <DialogDescription>
                                    Sélectionnez un abonné à renouveler ou remplissez les champs pour un nouvel abonné.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="subscriberToRenew" className="text-right">Abonné</Label>
                                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          aria-expanded={comboboxOpen}
                                          className="col-span-3 justify-between"
                                        >
                                          {selectedSubscriberId && selectedSubscriberId !== "new"
                                            ? subscribers.find((s) => s.id === selectedSubscriberId)?.name
                                            : "Sélectionner un abonné..."}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                          <CommandInput placeholder="Rechercher un abonné..." />
                                          <CommandList>
                                            <CommandEmpty>Aucun abonné trouvé.</CommandEmpty>
                                            <CommandGroup>
                                              <CommandItem
                                                value="new"
                                                onSelect={(currentValue) => {
                                                  setSelectedSubscriberId(currentValue === "new" ? "" : currentValue);
                                                  setComboboxOpen(false);
                                                }}
                                              >
                                                -- Nouvel Abonné --
                                              </CommandItem>
                                              {subscribers.map((s) => (
                                                <CommandItem
                                                  key={s.id}
                                                  value={s.id}
                                                  onSelect={(currentValue) => {
                                                    setSelectedSubscriberId(currentValue === selectedSubscriberId ? "" : currentValue);
                                                    setComboboxOpen(false);
                                                  }}
                                                >
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-4 w-4",
                                                      selectedSubscriberId === s.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                  />
                                                  {s.name}
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Nom</Label>
                                    <Input id="name" name="name" placeholder="Ex: Jean Dupont" className="col-span-3" required defaultValue={subscriberToRenew?.name} disabled={!!subscriberToRenew} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="phone" className="text-right">Téléphone</Label>
                                    <Input id="phone" name="phone" placeholder="Ex: +242 06 123 4567" className="col-span-3" required defaultValue={subscriberToRenew?.phone} disabled={!!subscriberToRenew} />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="plan" className="text-right">Abonnement</Label>
                                    <Select name="plan" required defaultValue="membre-kheops">
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Sélectionner un plan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="membre-kheops">Membre KHEOPS</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="duration" className="text-right">Durée (mois)</Label>
                                    <Input id="duration" name="duration" type="number" placeholder="Ex: 3" className="col-span-3" required defaultValue="1" min="1" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Valider</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
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
                  <TableHead className="hidden lg:table-cell">Contact Téléphonique</TableHead>
                  <TableHead>Abonnement</TableHead>
                  <TableHead className="hidden sm:table-cell">Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Date d'inscription</TableHead>
                  <TableHead className="hidden md:table-cell">Date de fin</TableHead>
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
                    <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                           <Phone className="h-4 w-4 text-muted-foreground" />
                           {subscriber.phone}
                        </div>
                    </TableCell>
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
                    <TableCell className="hidden md:table-cell">
                      {subscriber.endDate !== "N/A" ? (
                        subscriber.endDate
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarOff className="h-4 w-4" />
                          <span>N/A</span>
                        </div>
                      )}
                    </TableCell>
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
                          <DropdownMenuItem onClick={() => handleAction('view', subscriber.id)}>Voir le profil</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction('edit', subscriber.id)}>Modifier l'abonnement</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => handleAction('cancel', subscriber.id)}>Annuler l'abonnement</DropdownMenuItem>
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

    
