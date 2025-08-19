"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Music, Calendar as CalendarIcon, Clock, CheckCircle, SlidersHorizontal, Mic, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

const availableTimeSlots = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];
const services = [
    { id: "rental", label: "Location simple", price: "30000 FCFA/h", icon: Keyboard, description: "Accès complet à notre équipement de pointe pour vos projets." },
    { id: "recording", label: "Enregistrement + Ingénieur", price: "50000 FCFA/h", icon: Mic, description: "Session d'enregistrement guidée par un de nos ingénieurs du son." },
    { id: "mastering", label: "Mix & Mastering", price: "75000 FCFA/h", icon: SlidersHorizontal, description: "Finalisez vos pistes avec un traitement audio professionnel." },
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
        description: `Votre demande pour le ${format(date, "PPP", { locale: fr })} à ${selectedTime} est en cours de traitement.`,
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
            <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-accent"/> 1. Choisissez votre prestation</h3>
                            <div className="space-y-3">
                                {services.map((service) => (
                                    <Button
                                        key={service.id}
                                        variant={selectedService === service.id ? "secondary" : "outline"}
                                        onClick={() => setSelectedService(service.id)}
                                        className="w-full justify-start h-auto p-4 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-5 h-5 rounded-full border-2 ${selectedService === service.id ? 'bg-primary border-primary' : 'border-primary/50'}`}></div>
                                            <div>
                                                <p className="font-bold">{service.label}</p>
                                                <p className="text-sm text-muted-foreground">{service.price}</p>
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-accent"/> 2. Sélectionnez un créneau</h3>
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
                           <h3 className="text-lg font-semibold flex items-center gap-2 mb-4"><CalendarIcon className="w-5 h-5 text-accent"/> 3. Choisissez une date</h3>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal h-12 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary",
                                      !date && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
                                    initialFocus
                                    locale={fr}
                                    className="bg-card border-border rounded-md"
                                     classNames={{
                                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                        day_today: "bg-accent text-accent-foreground",
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>
                        </div>
                        <Button onClick={handleBooking} size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg h-12">
                           Valider et Payer
                        </Button>
                    </div>

                </div>
            </CardContent>
        </Card>
    </div>
  );
}