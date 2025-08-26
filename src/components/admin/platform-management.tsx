
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Youtube, Users, Eye, DollarSign, ExternalLink, Library, Headphones, PlusCircle, LinkIcon, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { getYoutubeChannelStats, YouTubeStats } from "@/ai/flows/youtube-stats-flow";
import { getSocialStats, SocialStats } from "@/ai/flows/ayrshare-flow";


const platformLinks = {
    youtube: "https://youtube.com/kheops",
    tiktok: "https://tiktok.com/@kheops",
    facebook: "https://facebook.com/kheops",
    spotify: "https://open.spotify.com/artist/example"
}

export type Payout = {
    id: string;
    platform: 'YouTube' | 'TikTok' | 'Facebook' | 'Spotify';
    date: string;
    amount: string;
    status: 'Payé' | 'En attente' | 'Annulé';
}

export const initialPayouts: Payout[] = [
    { id: 'p-001', platform: 'YouTube', date: '15/07/2024', amount: '1,500,000 FCFA', status: 'Payé' },
    { id: 'p-002', platform: 'TikTok', date: '12/07/2024', amount: '750,000 FCFA', status: 'Payé' },
    { id: 'p-003', platform: 'YouTube', date: '15/06/2024', amount: '1,350,000 FCFA', status: 'Payé' },
]

interface PlatformManagementProps {
    payouts: Payout[];
    setPayouts: React.Dispatch<React.SetStateAction<Payout[]>>;
    onAddPayout: (payout: Omit<Payout, 'id'>) => void;
}

export default function PlatformManagement({ payouts, setPayouts, onAddPayout }: PlatformManagementProps) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [youtubeStats, setYoutubeStats] = useState<YouTubeStats | null>(null);
  const [tiktokStats, setTiktokStats] = useState<SocialStats | null>(null);
  const [isLoadingYoutube, setIsLoadingYoutube] = useState(false);
  const [isLoadingTiktok, setIsLoadingTiktok] = useState(false);

  const handleAddPayout = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const platform = formData.get("platform") as Payout['platform'];
    const date = formData.get("date") as string;
    const amount = formData.get("amount") as string;

    const newPayout: Omit<Payout, 'id'> = {
        platform,
        date: new Date(date).toLocaleDateString('fr-FR'),
        amount: `${Number(amount).toLocaleString('fr-FR')} FCFA`,
        status: "En attente",
    };
    
    onAddPayout(newPayout);

    toast({
        title: "Opération Ajoutée",
        description: `Le paiement de ${platform} a été ajouté.`,
    });
    setDialogOpen(false);
  };
  
  const handleConnectYoutube = async () => {
    setIsLoadingYoutube(true);
    try {
        const stats = await getYoutubeChannelStats();
        if(stats) {
            setYoutubeStats(stats);
            toast({
                title: "Connexion Réussie",
                description: "Les statistiques de votre chaîne YouTube ont été chargées.",
            });
        } else {
             toast({
                title: "Erreur de Connexion",
                description: "Impossible de charger les statistiques. Vérifiez vos clés API dans le fichier .env.",
                variant: "destructive",
            });
        }
    } catch (error) {
        console.error(error);
        toast({
            title: "Erreur de Connexion",
            description: "Une erreur est survenue. Vérifiez la console pour plus de détails.",
            variant: "destructive",
        });
    } finally {
        setIsLoadingYoutube(false);
    }
  };
  
  const handleConnectTiktok = async () => {
    setIsLoadingTiktok(true);
    try {
        const stats = await getSocialStats('tiktok');
        if(stats) {
            setTiktokStats(stats);
            toast({
                title: "Statistiques TikTok chargées",
                description: "Les données de votre compte ont été récupérées via Ayrshare.",
            });
        } else {
            toast({
                title: "Erreur de Connexion",
                description: "Impossible de charger les statistiques TikTok. Vérifiez votre clé API Ayrshare dans le fichier .env.",
                variant: "destructive",
            });
        }
    } catch (error) {
        console.error(error);
        toast({
            title: "Erreur de Connexion",
            description: "Une erreur est survenue. Vérifiez la console pour plus de détails.",
            variant: "destructive",
        });
    } finally {
        setIsLoadingTiktok(false);
    }
  };

  const staticPlatformData = {
      facebook: { followers: "850K", reach: "3.2M", revenue: "5,000,000 FCFA" },
      spotify: { listeners: "250K", streams: "15M", revenue: "8,000,000 FCFA" }
  }


  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
        <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Youtube className="w-10 h-10 text-red-500" />
                        <div>
                            <CardTitle className="text-2xl">YouTube</CardTitle>
                            <CardDescription>Données de revenus et d'audience</CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                        <a href={platformLinks.youtube} target="_blank" rel="noopener noreferrer">
                           <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {youtubeStats ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-card/50 rounded-lg">
                            <Users className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xl font-bold">{youtubeStats.subscriberCount}</p>
                            <p className="text-xs text-muted-foreground">Abonnés</p>
                        </div>
                        <div className="p-3 bg-card/50 rounded-lg">
                            <Eye className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xl font-bold">{youtubeStats.viewCount}</p>
                            <p className="text-xs text-muted-foreground">Vues</p>
                        </div>
                        <div className="p-3 bg-card/50 rounded-lg">
                            <Library className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xl font-bold">{youtubeStats.videoCount}</p>
                            <p className="text-xs text-muted-foreground">Vidéos</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-card/50 rounded-lg">
                        <p className="text-muted-foreground mb-3">Connectez votre chaîne pour voir vos statistiques.</p>
                        <Button onClick={handleConnectYoutube} disabled={isLoadingYoutube}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            {isLoadingYoutube ? <><Loader2 className="animate-spin mr-2"/> Connexion...</> : 'Connecter à YouTube'}
                        </Button>
                         <p className="text-xs text-muted-foreground mt-2">Nécessite la configuration de la clé API dans le fichier .env</p>
                    </div>
                )}
            </CardContent>
        </Card>
        <Card className="border-cyan-500/30 bg-cyan-500/5">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Placeholder for TikTok Icon */}
                        <div className="w-10 h-10 flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500"><path d="M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 2v10.5"/><path d="M8 10.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/><path d="M18.5 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg>
                        </div>
                        <div>
                            <CardTitle className="text-2xl">TikTok</CardTitle>
                            <CardDescription>Données de revenus et d'audience</CardDescription>
                        </div>
                    </div>
                     <Button variant="ghost" size="icon" asChild>
                        <a href={platformLinks.tiktok} target="_blank" rel="noopener noreferrer">
                           <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </CardHeader>
             <CardContent className="space-y-4">
                {tiktokStats ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-card/50 rounded-lg">
                            <Users className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xl font-bold">{tiktokStats.followers.toLocaleString('fr-FR')}</p>
                            <p className="text-xs text-muted-foreground">Followers</p>
                        </div>
                        <div className="p-3 bg-card/50 rounded-lg">
                            <Eye className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xl font-bold">{tiktokStats.likes.toLocaleString('fr-FR')}</p>
                            <p className="text-xs text-muted-foreground">J'aime</p>
                        </div>
                         <div className="p-3 bg-card/50 rounded-lg">
                            <Users className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-xl font-bold">{tiktokStats.following.toLocaleString('fr-FR')}</p>
                            <p className="text-xs text-muted-foreground">Suivis</p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-card/50 rounded-lg">
                        <p className="text-muted-foreground mb-3">Actualisez les données de votre compte TikTok via Ayrshare.</p>
                        <Button onClick={handleConnectTiktok} disabled={isLoadingTiktok}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            {isLoadingTiktok ? <><Loader2 className="animate-spin mr-2"/> Chargement...</> : 'Actualiser les stats TikTok'}
                        </Button>
                         <p className="text-xs text-muted-foreground mt-2">Nécessite la configuration de la clé API Ayrshare dans le fichier .env</p>
                    </div>
                )}
            </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Facebook</CardTitle>
                            <CardDescription>Données de revenus et d'audience</CardDescription>
                        </div>
                    </div>
                     <Button variant="ghost" size="icon" asChild>
                        <a href={platformLinks.facebook} target="_blank" rel="noopener noreferrer">
                           <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-card/50 rounded-lg">
                    <Users className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xl font-bold">{staticPlatformData.facebook.followers}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="p-3 bg-card/50 rounded-lg">
                    <Eye className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xl font-bold">{staticPlatformData.facebook.reach}</p>
                    <p className="text-xs text-muted-foreground">Portée</p>
                </div>
                <div className="p-3 bg-card/50 rounded-lg">
                    <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-500" />
                    <p className="text-xl font-bold">{staticPlatformData.facebook.revenue}</p>
                    <p className="text-xs text-muted-foreground">Revenu total est.</p>
                </div>
            </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path><path d="M8.5 11.5a3 3 0 1 0 3-3 3 3 0 0 0-3 3z"></path><path d="M15.5 12.5a3 3 0 1 0 3-3 3 3 0 0 0-3 3z"></path></svg>
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Spotify</CardTitle>
                            <CardDescription>Données de revenus et d'audience</CardDescription>
                        </div>
                    </div>
                     <Button variant="ghost" size="icon" asChild>
                        <a href={platformLinks.spotify} target="_blank" rel="noopener noreferrer">
                           <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-card/50 rounded-lg">
                    <Headphones className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xl font-bold">{staticPlatformData.spotify.listeners}</p>
                    <p className="text-xs text-muted-foreground">Auditeurs/mois</p>
                </div>
                <div className="p-3 bg-card/50 rounded-lg">
                    <Library className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xl font-bold">{staticPlatformData.spotify.streams}</p>
                    <p className="text-xs text-muted-foreground">Streams</p>
                </div>
                <div className="p-3 bg-card/50 rounded-lg">
                    <DollarSign className="w-6 h-6 mx-auto mb-1 text-green-500" />
                    <p className="text-xl font-bold">{staticPlatformData.spotify.revenue}</p>
                    <p className="text-xs text-muted-foreground">Revenu total est.</p>
                </div>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader className="flex flex-row justify-between items-start">
            <div>
                <CardTitle>Historique des Paiements</CardTitle>
                <CardDescription>
                    Suivi des paiements reçus des différentes plateformes.
                </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter une opération
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <form onSubmit={handleAddPayout}>
                        <DialogHeader>
                            <DialogTitle>Ajouter une Opération</DialogTitle>
                            <DialogDescription>Saisissez les détails du paiement reçu.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="platform">Plateforme</Label>
                                <Select name="platform" required>
                                    <SelectTrigger><SelectValue placeholder="Sélectionner..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="YouTube">YouTube</SelectItem>
                                        <SelectItem value="TikTok">TikTok</SelectItem>
                                        <SelectItem value="Facebook">Facebook</SelectItem>
                                        <SelectItem value="Spotify">Spotify</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" name="date" type="date" required/>
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="amount">Montant (FCFA)</Label>
                                <Input id="amount" name="amount" type="number" placeholder="Ex: 1500000" required/>
                             </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Ajouter</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plateforme</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {payout.platform === 'YouTube' ? <Youtube className="text-red-500"/> :
                     payout.platform === 'TikTok' ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500"><path d="M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 2v10.5"/><path d="M8 10.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/><path d="M18.5 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg> :
                     payout.platform === 'Facebook' ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> :
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path><path d="M8.5 11.5a3 3 0 1 0 3-3 3 3 0 0 0-3 3z"></path><path d="M15.5 12.5a3 3 0 1 0 3-3 3 3 0 0 0-3 3z"></path></svg>
                    }
                    {payout.platform}
                  </TableCell>
                  <TableCell>{payout.date}</TableCell>
                  <TableCell className="font-semibold text-green-600">{payout.amount}</TableCell>
                  <TableCell>{payout.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
