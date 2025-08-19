
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Music, CalendarCheck, Clock, CheckCircle, SlidersHorizontal, Mic, Keyboard } from "lucide-react";

const availableTimeSlots = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];
const services = [
    { id: "rental", label: "Location simple", price: "50€/h", icon: Keyboard, description: "Accès complet à notre équipement de pointe pour vos projets." },
    { id: "recording", label: "Enregistrement + Ingénieur", price: "80€/h", icon: Mic, description: "Session d'enregistrement guidée par un de nos ingénieurs du son." },
    { id: "mastering", label: "Mix & Mastering", price: "120€/h", icon: SlidersHorizontal, description: "Finalisez vos pistes avec un traitement audio professionnel." },
];

export default function StudioHub() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>("recording");
  const { toast } = useToast();

  const handleBooking = () => {
    if (!date || !selectedTime || !selectedService) {
      toast({
        title: "Champs manquants",
        description: "Veuillez sélectionner une date, un créneau et une prestation.",
        variant: "destructive",
      });
      return;
    }
    toast({
        title: "Réservation en cours",
        description: `Votre demande pour le ${date.toLocaleDateString('fr-FR')} à ${selectedTime} est en cours de traitement.`,
    });
    // Stripe integration would go here
  };

  return (
    <div className="space-y-12">
        <header className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-primary font-headline tracking-wider">KHEOPS STUDIO</h1>
            <p className="text-muted-foreground text-lg">Donnez vie à votre musique dans un environnement professionnel.</p>
        </header>

        <section>
            <h2 className="text-3xl font-semibold font-headline text-center mb-8">Découvrez nos prestations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service) => (
                    <Card key={service.id} className="bg-card border-border/50 text-center p-6 flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                        <div className="mb-4 text-primary bg-primary/10 p-3 rounded-full">
                           <service.icon className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-xl font-bold mb-2">{service.label}</CardTitle>
                        <CardDescription className="text-muted-foreground flex-grow mb-4">{service.description}</CardDescription>
                        <p className="text-2xl font-bold text-accent">{service.price}</p>
                    </Card>
                ))}
            </div>
        </section>

        <Card className="bg-card border-border/50 max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="text-3xl font-headline flex items-center gap-3">
                    <Music className="w-8 h-8 text-accent" />
                    Réservez Votre Session
                </CardTitle>
                <CardDescription>
                    Planifiez votre prochaine session en quelques clics.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                         <div>
                           <Label className="text-lg font-semibold flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-accent"/> 1. Choisissez votre prestation</Label>
                           <RadioGroup value={selectedService} onValueChange={setSelectedService} className="space-y-2">
                             {services.map((service) => (
                                <Label key={service.id} htmlFor={service.id} className="flex items-center justify-between p-3 rounded-md border border-border/50 cursor-pointer has-[input:checked]:border-primary has-[input:checked]:bg-primary/5 transition-colors">
                                    <div>
                                        <span className="font-semibold">{service.label}</span>
                                        <p className="text-sm text-muted-foreground">{service.price}</p>
                                    </div>
                                    <RadioGroupItem value={service.id} id={service.id} />
                                </Label>
                             ))}
                           </RadioGroup>
                        </div>
                        <div>
                           <Label className="text-lg font-semibold flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-accent"/> 2. Sélectionnez un créneau</Label>
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availableTimeSlots.map((time) => (
                                <Button key={time} variant={selectedTime === time ? "default" : "outline"} onClick={() => setSelectedTime(time)} className={`transition-colors ${selectedTime === time ? 'bg-primary text-primary-foreground' : 'border-primary/50 text-primary hover:bg-primary/10'}`}>
                                    {time}
                                </Button>
                            ))}
                           </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                             <Label className="text-lg font-semibold flex items-center gap-2 mb-4"><CalendarCheck className="w-5 h-5 text-accent"/> 3. Choisissez une date</Label>
                            <div className="rounded-md border border-border/50 bg-background/50 p-3">
                               <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="p-0"
                                    classNames={{
                                        root: "w-full",
                                        caption: "flex justify-center items-center relative mb-4",
                                        caption_label: "text-lg font-bold text-primary-foreground",
                                        nav_button: "h-8 w-8 bg-transparent hover:bg-accent/20 p-0 absolute rounded-full",
                                        nav_button_previous: "left-0",
                                        nav_button_next: "right-0",
                                        head_row: "flex justify-between mb-2 px-2",
                                        head_cell: 'text-muted-foreground uppercase text-xs w-full font-medium',
                                        row: "flex w-full justify-between mt-2",
                                        cell: 'text-center text-sm p-0 relative w-full',
                                        day: 'w-full h-10 rounded-md hover:bg-accent/20 transition-colors',
                                        day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary focus:text-primary-foreground',
                                        day_today: 'bg-accent/30 text-accent-foreground font-bold border border-accent',
                                        day_outside: 'text-muted-foreground/50 opacity-50',
                                        day_disabled: 'text-muted-foreground opacity-50',
                                    }}
                                    disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
                                />
                            </div>
                        </div>
                        <Button onClick={handleBooking} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg">
                           Valider et Payer
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
