"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Music, Calendar as CalendarIcon, Clock, SlidersHorizontal, Mic, AudioLines, User } from "lucide-react";
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  artistName: z.string().min(1, { message: "Veuillez saisir votre nom d'artiste." }),
  serviceId: z.string({ required_error: "Veuillez choisir une prestation." }),
  timeSlot: z.string({ required_error: "Veuillez sélectionner un créneau." }),
  date: z.date({ required_error: "Veuillez choisir une date." }),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const availableTimeSlots = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];
const services = [
    { id: "voice-recording", label: "Prise de voix", price: "30 000 FCFA/h", icon: Mic, description: "Enregistrement de haute qualité de vos voix pour chansons, podcasts ou voix-off." },
    { id: "voice-mix", label: "Prise de voix + Mix", price: "50 000 FCFA/h", icon: AudioLines, description: "Enregistrement et mixage de vos pistes vocales pour un son équilibré et clair." },
    { id: "full-package", label: "Prise de voix + Mix + Mastering", price: "75 000 FCFA/h", icon: SlidersHorizontal, description: "Le service complet pour des pistes vocales prêtes à la diffusion." },
];

export default function StudioHub() {
  const { toast } = useToast();
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: "voice-mix",
      artistName: "",
    },
  });

  const onSubmit = (data: BookingFormValues) => {
    const selectedService = services.find(s => s.id === data.serviceId);
    toast({
        title: "Réservation confirmée !",
        description: `Bonjour ${data.artistName}, votre session "${selectedService?.label}" est réservée pour le ${format(data.date, "PPP", { locale: fr })} de ${data.timeSlot}.`,
    });
    form.reset();
  };
  
  const selectedServiceId = form.watch("serviceId");

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

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-6">
                           <FormField
                              control={form.control}
                              name="artistName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-lg font-semibold flex items-center gap-2 mb-2"><User className="w-5 h-5 text-accent"/>Nom d'artiste</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Saisissez votre nom d'artiste" {...field} className="border-primary/50" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                                control={form.control}
                                name="serviceId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg font-semibold flex items-center gap-2 mb-4"><Mic className="w-5 h-5 text-accent"/>1. Choisissez votre prestation</FormLabel>
                                        <div className="space-y-3">
                                            {services.map((service) => (
                                                <Button
                                                    key={service.id}
                                                    variant={selectedServiceId === service.id ? "secondary" : "outline"}
                                                    onClick={() => field.onChange(service.id)}
                                                    className="w-full justify-start h-auto p-4 text-left"
                                                    type="button"
                                                >
                                                  <div className="flex items-center gap-4">
                                                      <div className={`w-5 h-5 rounded-full border-2 ${selectedServiceId === service.id ? 'bg-primary border-primary' : 'border-primary/50'}`}></div>
                                                      <div>
                                                          <p className="font-bold">{service.label}</p>
                                                          <p className="text-sm text-muted-foreground">{service.price}</p>
                                                      </div>
                                                  </div>
                                                </Button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-6">
                           <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-lg font-semibold flex items-center gap-2 mb-4"><CalendarIcon className="w-5 h-5 text-accent"/> 3. Choisissez une date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal h-12 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                              <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="timeSlot"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-lg font-semibold flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-accent"/> 2. Sélectionnez un créneau</FormLabel>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {availableTimeSlots.map((time) => (
                                                <Button 
                                                  key={time} 
                                                  variant={field.value === time ? "default" : "outline"} 
                                                  onClick={() => field.onChange(time)} 
                                                  className={`transition-colors ${field.value === time ? 'bg-primary text-primary-foreground' : 'border-primary/50 text-primary hover:bg-primary/10'}`}
                                                  type="button"
                                                >
                                                    {time}
                                                </Button>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg h-12">
                               Valider et Payer
                            </Button>
                        </div>
                      </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    </div>
  );
}
