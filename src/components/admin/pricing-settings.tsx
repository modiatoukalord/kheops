
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Percent, Music } from "lucide-react";
import { KHEOPS_MEMBER_FEE, servicesWithPrices } from "@/lib/pricing";

export default function PricingSettings() {
  const { toast } = useToast();
  const [studioPrices, setStudioPrices] = useState(servicesWithPrices);
  const [memberFee, setMemberFee] = useState(KHEOPS_MEMBER_FEE);

  const handleSave = (section: string) => {
    // In a real app, you'd save this to a database or configuration file.
    // For now, we just show a toast.
    toast({
      title: "Paramètres Enregistrés",
      description: `Les tarifs de la section "${section}" ont été mis à jour.`,
    });
  };

  const handleStudioPriceChange = (service: string, value: string) => {
    setStudioPrices(prev => ({
        ...prev,
        [service]: Number(value)
    }));
  };

  return (
    <div className="space-y-8">
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
    </div>
  );
}
