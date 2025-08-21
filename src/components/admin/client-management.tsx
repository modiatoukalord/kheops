
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MoreHorizontal, User, Mail, Calendar, DollarSign, PlusCircle, Phone, Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastActivity: string;
  totalSpent: number;
  lastService: string;
};

interface ClientManagementProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

export default function ClientManagement({ clients, setClients }: ClientManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddClientDialogOpen, setAddClientDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalClients = clients.length;
  const totalSpentAllClients = clients.reduce((acc, client) => acc + client.totalSpent, 0);

  const handleAddClient = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const lastService = formData.get("lastService") as string;
    const totalSpent = parseFloat(formData.get("totalSpent") as string) || 0;


    const newClient: Client = {
      id: `client-${Date.now()}`,
      name,
      email: `${name.toLowerCase().replace(/\s/g, '.')}@example.com`,
      phone,
      lastActivity: new Date().toISOString().split("T")[0],
      totalSpent: totalSpent,
      lastService: lastService || "N/A",
    };

    setClients(prev => [newClient, ...prev]);
    toast({
      title: "Client Ajouté",
      description: `Le client "${name}" a été ajouté avec succès.`,
    });
    setAddClientDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nombre de Clients</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalClients}</div>
                <p className="text-xs text-muted-foreground">Clients uniques (non-abonnés)</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dépenses Totales (Services)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalSpentAllClients.toLocaleString('fr-FR')} FCFA</div>
                <p className="text-xs text-muted-foreground">Revenu total généré par les services ponctuels</p>
            </CardContent>
        </Card>
      </section>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Gestion des Clients</CardTitle>
              <CardDescription>
                Gérez les clients non-abonnés qui utilisent des services à la journée.
              </CardDescription>
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
                <Dialog open={isAddClientDialogOpen} onOpenChange={setAddClientDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Ajouter un client
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleAddClient}>
                            <DialogHeader>
                                <DialogTitle>Ajouter un nouveau client</DialogTitle>
                                <DialogDescription>
                                    Remplissez les informations pour créer un nouveau client.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nom complet</Label>
                                    <Input id="name" name="name" placeholder="Ex: Jean Dupont" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Numéro de téléphone</Label>
                                    <Input id="phone" name="phone" placeholder="Ex: +242 06 123 4567" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastService">Dernier Service</Label>
                                    <Input id="lastService" name="lastService" placeholder="Ex: Prise de voix + Mix" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totalSpent">Total Dépensé (FCFA)</Label>
                                    <Input id="totalSpent" name="totalSpent" type="number" placeholder="Ex: 50000" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Ajouter le client</Button>
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
                  <TableHead>Nom</TableHead>
                  <TableHead className="hidden sm:table-cell">Téléphone</TableHead>
                  <TableHead className="hidden md:table-cell">Dernier Service</TableHead>
                  <TableHead>Total Dépensé</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {client.phone}
                        </div>
                      </TableCell>
                       <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                           <Settings2 className="h-4 w-4 text-muted-foreground" />
                           {client.lastService}
                        </div>
                      </TableCell>
                      <TableCell>
                          <div className="font-semibold">{client.totalSpent.toLocaleString('fr-FR')} FCFA</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Voir le profil</DropdownMenuItem>
                            <DropdownMenuItem>Envoyer un message</DropdownMenuItem>
                            <DropdownMenuItem>Créer un contrat</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Aucun client trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
