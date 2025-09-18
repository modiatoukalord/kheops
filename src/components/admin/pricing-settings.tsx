
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Percent, Music, Tag, PlusCircle, Edit, Trash2, Palette, FileSignature, Gem } from "lucide-react";
import { KHEOPS_MEMBER_FEE, servicesWithPrices } from "@/lib/pricing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { iconList, iconMap } from "@/lib/icons";
import { tierConfig } from "@/components/admin/client-management";

export type ActivityCategory = {
    id: string;
    name: string;
    icon: string;
    color: string;
};

export type ContractTypeConfig = {
    id: string;
    name: string;
    icon: string;
    color: string;
};

const tailwindColors = ["slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"];

export default function PricingSettings() {
  const { toast } = useToast();
  const [studioPrices, setStudioPrices] = useState(servicesWithPrices);
  const [memberFee, setMemberFee] = useState(KHEOPS_MEMBER_FEE);
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>([]);
  const [contractTypes, setContractTypes] = useState<ContractTypeConfig[]>([]);
  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [isContractTypeDialogOpen, setContractTypeDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ActivityCategory | null>(null);
  const [editingContractType, setEditingContractType] = useState<ContractTypeConfig | null>(null);
  const [loyaltyTiers, setLoyaltyTiers] = useState({
    Argent: 5,
    Or: 10,
    Platine: 25,
    Diamant: 50,
  });

  useEffect(() => {
    const unsubActivityCategories = onSnapshot(collection(db, "activityCategories"), (snapshot) => {
        setActivityCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityCategory)));
    });
    
    const unsubContractTypes = onSnapshot(collection(db, "contractTypes"), (snapshot) => {
        setContractTypes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContractTypeConfig)));
    });
    
    return () => {
        unsubActivityCategories();
        unsubContractTypes();
    };
  }, []);

  const handleSave = (section: string) => {
    // In a real app, you'd save this to a database or configuration file.
    // For now, we just show a toast.
    toast({
      title: "Paramètres Enregistrés",
      description: `Les paramètres de la section "${section}" ont été mis à jour.`,
    });
  };

  const handleStudioPriceChange = (service: string, value: string) => {
    setStudioPrices(prev => ({
        ...prev,
        [service]: Number(value)
    }));
  };
  
  const handleCategoryFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const categoryData = {
        name: formData.get("name") as string,
        icon: formData.get("icon") as string,
        color: formData.get("color") as string,
    };

    try {
        if (editingCategory) {
            const categoryRef = doc(db, "activityCategories", editingCategory.id);
            await updateDoc(categoryRef, categoryData);
            toast({ title: "Catégorie Modifiée", description: `La catégorie "${categoryData.name}" a été mise à jour.` });
        } else {
            await addDoc(collection(db, "activityCategories"), categoryData);
            toast({ title: "Catégorie Ajoutée", description: `La catégorie "${categoryData.name}" a été ajoutée.` });
        }
        setCategoryDialogOpen(false);
        setEditingCategory(null);
    } catch (error) {
        console.error("Error saving category: ", error);
        toast({ title: "Erreur", description: "Impossible d'enregistrer la catégorie.", variant: "destructive" });
    }
  };

  const handleOpenCategoryDialog = (category: ActivityCategory | null) => {
    setEditingCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
        try {
            await deleteDoc(doc(db, "activityCategories", categoryId));
            toast({ title: "Catégorie Supprimée", variant: "destructive" });
        } catch (error) {
             console.error("Error deleting category: ", error);
             toast({ title: "Erreur", description: "Impossible de supprimer la catégorie.", variant: "destructive" });
        }
    }
  };
  
  const handleContractTypeFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const contractTypeData = {
        name: formData.get("name") as string,
        icon: formData.get("icon") as string,
        color: formData.get("color") as string,
    };

    try {
        if (editingContractType) {
            const typeRef = doc(db, "contractTypes", editingContractType.id);
            await updateDoc(typeRef, contractTypeData);
            toast({ title: "Type de Contrat Modifié", description: `Le type "${contractTypeData.name}" a été mis à jour.` });
        } else {
            await addDoc(collection(db, "contractTypes"), contractTypeData);
            toast({ title: "Type de Contrat Ajouté", description: `Le type "${contractTypeData.name}" a été ajouté.` });
        }
        setContractTypeDialogOpen(false);
        setEditingContractType(null);
    } catch (error) {
        console.error("Error saving contract type: ", error);
        toast({ title: "Erreur", description: "Impossible d'enregistrer le type de contrat.", variant: "destructive" });
    }
  };

  const handleOpenContractTypeDialog = (contractType: ContractTypeConfig | null) => {
    setEditingContractType(contractType);
    setContractTypeDialogOpen(true);
  };

  const handleDeleteContractType = async (typeId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce type de contrat ?")) {
        try {
            await deleteDoc(doc(db, "contractTypes", typeId));
            toast({ title: "Type de Contrat Supprimé", variant: "destructive" });
        } catch (error) {
             console.error("Error deleting contract type: ", error);
             toast({ title: "Erreur", description: "Impossible de supprimer le type.", variant: "destructive" });
        }
    }
  };


  const getCategoryColorClass = (color: string) => {
      return `bg-${color}-500 text-white`;
  };

  return (
    <Tabs defaultValue="studio" className="space-y-8">
      <TabsList>
        <TabsTrigger value="studio">Tarifs & Abonnements</TabsTrigger>
        <TabsTrigger value="categories">Catégories d'Activité</TabsTrigger>
        <TabsTrigger value="contract-types">Types de Contrat</TabsTrigger>
        <TabsTrigger value="loyalty">Fidélité</TabsTrigger>
      </TabsList>

      <TabsContent value="studio" className="space-y-8">
         <Card>
            <CardHeader>
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-purple-500/20 text-purple-500 p-3 rounded-full">
                    <Music className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle>Tarifs du Studio</CardTitle>
                    <CardDescription>Définissez les prix pour les différentes prestations du studio.</CardDescription>
                </div>
            </div>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
                {Object.entries(studioPrices).map(([service, price]) => (
                    <div className="space-y-2" key={service}>
                        <Label htmlFor={`price-${service}`}>{service}</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id={`price-${service}`} 
                                type="number" 
                                value={price}
                                onChange={(e) => handleStudioPriceChange(service, e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                ))}
            </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 justify-end">
                <Button onClick={() => handleSave("Tarifs du Studio")}>Enregistrer</Button>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-cyan-500/20 text-cyan-500 p-3 rounded-full">
                    <DollarSign className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle>Abonnement</CardTitle>
                    <CardDescription>Gérez le prix de l'abonnement mensuel pour les membres.</CardDescription>
                </div>
            </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 max-w-sm">
                    <Label htmlFor="subscription-price">Prix de l'abonnement mensuel (FCFA)</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="subscription-price" 
                            type="number" 
                            value={memberFee}
                            onChange={(e) => setMemberFee(Number(e.target.value))}
                            className="pl-10" 
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 justify-end">
                <Button onClick={() => handleSave("Abonnement")}>Enregistrer</Button>
            </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="categories">
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-orange-500/20 text-orange-500 p-3 rounded-full">
                            <Tag className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Catégories d'Activité</CardTitle>
                            <CardDescription>Gérez les catégories pour le journal d'activité.</CardDescription>
                        </div>
                    </div>
                    <Dialog open={isCategoryDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingCategory(null); setCategoryDialogOpen(isOpen); }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenCategoryDialog(null)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter une catégorie
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleCategoryFormSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingCategory ? "Modifier la catégorie" : "Nouvelle Catégorie"}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cat-name">Nom</Label>
                                        <Input id="cat-name" name="name" defaultValue={editingCategory?.name} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cat-icon">Icône</Label>
                                            <Select name="icon" defaultValue={editingCategory?.icon} required>
                                                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                                <SelectContent>
                                                    {iconList.map(iconName => {
                                                        const Icon = iconMap[iconName];
                                                        return <SelectItem key={iconName} value={iconName}><Icon className="mr-2 h-4 w-4 inline-block"/> {iconName}</SelectItem>
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="cat-color">Couleur</Label>
                                            <Select name="color" defaultValue={editingCategory?.color} required>
                                                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                                <SelectContent>
                                                    {tailwindColors.map(color => (
                                                        <SelectItem key={color} value={color}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`h-4 w-4 rounded-full bg-${color}-500`}></div>
                                                                {color}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">{editingCategory ? "Enregistrer" : "Ajouter"}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {activityCategories.map(cat => {
                        const Icon = iconMap[cat.icon as keyof typeof iconMap] || Tag;
                        return (
                            <div key={cat.id} className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 relative group border ${getCategoryColorClass(cat.color)}`}>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => handleOpenCategoryDialog(cat)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => handleDeleteCategory(cat.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Icon className="h-8 w-8" />
                                <span className="font-bold text-center">{cat.name}</span>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="contract-types">
         <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 bg-blue-500/20 text-blue-500 p-3 rounded-full">
                            <FileSignature className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle>Types de Contrat</CardTitle>
                            <CardDescription>Gérez les différentes catégories de contrats.</CardDescription>
                        </div>
                    </div>
                    <Dialog open={isContractTypeDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingContractType(null); setContractTypeDialogOpen(isOpen); }}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenContractTypeDialog(null)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter un type
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleContractTypeFormSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingContractType ? "Modifier le type" : "Nouveau Type de Contrat"}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ct-name">Nom</Label>
                                        <Input id="ct-name" name="name" defaultValue={editingContractType?.name} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="ct-icon">Icône</Label>
                                            <Select name="icon" defaultValue={editingContractType?.icon} required>
                                                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                                <SelectContent>
                                                    {iconList.map(iconName => {
                                                        const Icon = iconMap[iconName];
                                                        return <SelectItem key={iconName} value={iconName}><Icon className="mr-2 h-4 w-4 inline-block"/> {iconName}</SelectItem>
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="ct-color">Couleur</Label>
                                            <Select name="color" defaultValue={editingContractType?.color} required>
                                                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                                <SelectContent>
                                                    {tailwindColors.map(color => (
                                                        <SelectItem key={color} value={color}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`h-4 w-4 rounded-full bg-${color}-500`}></div>
                                                                {color}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">{editingContractType ? "Enregistrer" : "Ajouter"}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {contractTypes.map(cat => {
                        const Icon = iconMap[cat.icon as keyof typeof iconMap] || FileSignature;
                        return (
                            <div key={cat.id} className={`p-4 rounded-lg flex flex-col items-center justify-center gap-2 relative group border ${getCategoryColorClass(cat.color)}`}>
                                 <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => handleOpenContractTypeDialog(cat)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => handleDeleteContractType(cat.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Icon className="h-8 w-8" />
                                <span className="font-bold text-center">{cat.name}</span>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="loyalty">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 bg-yellow-500/20 text-yellow-500 p-3 rounded-full">
                <Gem className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>Niveaux de Fidélité</CardTitle>
                <CardDescription>Définissez le nombre de points d'activité requis pour chaque niveau.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              {Object.entries(tierConfig).map(([tierName, tierInfo]) => {
                if (tierName === 'Bronze') return null;
                const tierKey = tierName as keyof typeof loyaltyTiers;
                return (
                  <div key={tierName} className="space-y-2">
                    <Label htmlFor={`loyalty-${tierName}`} className="flex items-center gap-2">
                        <tierInfo.icon className={`h-4 w-4 ${tierInfo.color}`} />
                        {tierName}
                    </Label>
                    <Input
                      id={`loyalty-${tierName}`}
                      type="number"
                      value={loyaltyTiers[tierKey]}
                      onChange={(e) => setLoyaltyTiers(prev => ({ ...prev, [tierKey]: Number(e.target.value) }))}
                      placeholder={`Points pour ${tierName}`}
                    />
                  </div>
                )
              })}
               <div className="space-y-2 col-span-full sm:col-span-1 flex items-end">
                 <p className="text-sm text-muted-foreground w-full text-center p-2 rounded-md bg-muted">Le niveau Bronze est attribué par défaut pour 0 point.</p>
               </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 justify-end">
            <Button onClick={() => handleSave("Niveaux de Fidélité")}>Enregistrer les Niveaux</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
