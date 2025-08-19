"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Music, CalendarCheck, Clock, CheckCircle } from "lucide-react";
import type { DateRange } from "react-day-picker";

const availableTimeSlots = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];
const services = [
    { id: "rental", label: "Location simple", price: "50€/h" },
    { id: "recording", label: "Enregistrement + Ingénieur", price: "80€/h" },
    { id: "mastering", label: "Mix & Mastering", price: "120€/h" },
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

        <Card className="bg-card border-border/50">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="text-3xl font-headline flex items-center gap-2">
                            <Music className="w-8 h-8 text-accent" />
                            Réservez Votre Session
                        </CardTitle>
                        <CardDescription>
                            Sélectionnez une date, un créneau et la prestation désirée pour votre prochaine session d'enregistrement.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                        <div>
                            <Label className="text-lg font-semibold flex items-center gap-2 mb-2"><CalendarCheck className="w-5 h-5 text-accent"/> Date</Label>
                            <div className="rounded-md border border-border/50 bg-background/50">
                               <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="p-0"
                                    classNames={{
                                        head_cell: 'text-muted-foreground w-full',
                                        cell: 'w-full',
                                        day: 'w-full h-10',
                                        day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
                                        day_today: 'bg-accent/20 text-accent-foreground',
                                    }}
                                    disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
                                />
                            </div>
                        </div>
                        <div>
                           <Label className="text-lg font-semibold flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-accent"/> Créneaux disponibles</Label>
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availableTimeSlots.map((time) => (
                                <Button key={time} variant={selectedTime === time ? "default" : "outline"} onClick={() => setSelectedTime(time)} className={`${selectedTime === time ? 'bg-primary text-primary-foreground' : 'border-primary/50 text-primary hover:bg-primary/10'}`}>
                                    {time}
                                </Button>
                            ))}
                           </div>
                        </div>
                         <div>
                           <Label className="text-lg font-semibold flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-accent"/> Prestation</Label>
                           <RadioGroup value={selectedService} onValueChange={setSelectedService} className="space-y-2">
                             {services.map((service) => (
                                <Label key={service.id} htmlFor={service.id} className="flex items-center justify-between p-4 rounded-md border border-border/50 cursor-pointer has-[input:checked]:border-primary has-[input:checked]:bg-primary/5">
                                    <div>
                                        <span>{service.label}</span>
                                        <p className="text-sm text-muted-foreground">{service.price}</p>
                                    </div>
                                    <RadioGroupItem value={service.id} id={service.id} />
                                </Label>
                             ))}
                           </RadioGroup>
                        </div>
                        <Button onClick={handleBooking} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg">
                           Valider et Payer
                        </Button>
                    </CardContent>
                </div>
                <div className="hidden lg:block bg-center bg-cover rounded-r-lg" style={{backgroundImage: "url('https://placehold.co/600x800')"}} data-ai-hint="music studio">
                    <div className="h-full w-full bg-black/50 rounded-r-lg"></div>
                </div>
            </div>
        </Card>
    </div>
  );
}
