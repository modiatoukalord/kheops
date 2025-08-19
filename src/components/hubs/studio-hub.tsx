
"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Music, Calendar as CalendarIcon, Clock, SlidersHorizontal, Mic, AudioLines, User, DiscAlbum, FileText, ListMusic, Pencil, Plus, Minus, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const trackSchema = z.object({
  name: z.string().min(1, { message: "Veuillez nommer le titre." }),
  date: z.date({ required_error: "Veuillez choisir une date." }).optional(),
  timeSlot: z.string({ required_error: "Veuillez sélectionner un créneau." }).optional(),
});

const bookingSchema = z.object({
  artistName: z.string().min(1, { message: "Veuillez saisir le nom de l'artiste ou du groupe." }),
  projectName: z.string().min(1, { message: "Veuillez saisir le nom du projet." }),
  phoneNumber: z.string()
    .min(1, { message: "Veuillez saisir votre numéro de téléphone." })
    .regex(/^\+242\s?(\d{2}\s?\d{3}\s?\d{4}|\d{9})$/, "Veuillez saisir un numéro valide au format +242 XX XXX XXXX."),
  projectType: z.string({ required_error: "Veuillez choisir le type de projet." }),
  serviceId: z.string({ required_error: "Veuillez choisir une prestation." }),
  timeSlot: z.string().optional(),
  date: z.date().optional(),
  tracks: z.array(trackSchema).min(1, "Veuillez ajouter au moins un titre.")
}).superRefine((data, ctx) => {
    if (data.projectType === 'single') {
        if (!data.date) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['date'],
                message: 'Veuillez choisir une date.',
            });
        }
        if (!data.timeSlot) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['timeSlot'],
                message: 'Veuillez sélectionner un créneau.',
            });
        }
    } else if (data.projectType) {
        data.tracks.forEach((track, index) => {
            if (!track.date) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [`tracks.${index}.date`],
                    message: 'Date requise.',
                });
            }
            if (!track.timeSlot) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [`tracks.${index}.timeSlot`],
                    message: 'Créneau requis.',
                });
            }
        });
    }
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const availableTimeSlots = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];
const services = [
    { id: "voice-recording", label: "Prise de voix", price: "30 000 FCFA/h", icon: Mic, description: "Enregistrement de haute qualité de vos voix pour chansons, podcasts ou voix-off." },
    { id: "voice-mix", label: "Prise de voix + Mix", price: "50 000 FCFA/h", icon: AudioLines, description: "Enregistrement et mixage de vos pistes vocales pour un son équilibré et clair." },
    { id: "full-package", label: "Prise de voix + Mix + Mastering", price: "75 000 FCFA/h", icon: SlidersHorizontal, description: "Le service complet pour des pistes vocales prêtes à la diffusion." },
];
const projectTypes = [
  { id: "single", label: "Single" },
  { id: "mixtape", label: "Mixtape" },
  { id: "album", label: "Album" },
];


export default function StudioHub() {
  const { toast } = useToast();
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: "voice-mix",
      artistName: "",
      projectName: "",
      phoneNumber: "",
      tracks: [{ name: "" }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "tracks",
  });
  
  const projectType = form.watch("projectType");

  React.useEffect(() => {
    const trackName = projectType === 'single' ? "Titre unique" : "";
    if (projectType === 'single') {
        replace([{ name: trackName }]);
    }
  }, [projectType, replace]);


  const handleTrackCountChange = (value: number) => {
    const count = Math.max(1, value || 1);
    const difference = count - fields.length;
    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        append({ name: "" });
      }
    } else if (difference < 0) {
      for (let i = 0; i < Math.abs(difference); i++) {
        remove(fields.length - 1 - i);
      }
    }
  };


  const onSubmit = (data: BookingFormValues) => {
    const selectedService = services.find(s => s.id === data.serviceId);
    let description = `Bonjour ${data.artistName}, votre session "${selectedService?.label}" pour le projet "${data.projectName}" (${data.projectType}) a été demandée. Nous vous contacterons au ${data.phoneNumber}.`;
    
    if (data.projectType === 'single' && data.date && data.timeSlot) {
      description += ` Session unique le ${format(data.date, "PPP", { locale: fr })} de ${data.timeSlot}.`;
    } else {
        const trackDetails = data.tracks.map(t => `${t.name} (le ${t.date ? format(t.date, "PPP", { locale: fr }) : 'date non spécifiée'} à ${t.timeSlot || 'créneau non spécifié'})`).join('; ');
        description += ` Détails des sessions: ${trackDetails}.`;
    }

    toast({
        title: "Demande de réservation envoyée !",
        description: "Nous vous contacterons bientôt pour confirmer la disponibilité.",
        variant: "default"
    });
    form.reset({
      serviceId: "voice-mix",
      artistName: "",
      projectName: "",
      phoneNumber: "",
      tracks: [{ name: "" }],
      projectType: undefined,
      date: undefined,
      timeSlot: undefined,
    });
    replace([{ name: "" }]);
  };

  return (
    <div className="space-y-12">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-primary font-headline tracking-wider">KHEOPS STUDIO</h1>
        <p className="text-muted-foreground text-lg">Donnez vie à vos projets musicaux dans un environnement professionnel.</p>
      </header>

      <div className="w-full max-w-4xl mx-auto">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl"><User className="text-accent w-7 h-7" /> Informations sur le Projet</CardTitle>
                    <CardDescription>Commencez par nous en dire plus sur vous et votre projet.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 pt-2">
                    <FormField control={form.control} name="artistName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom de l'artiste / Groupe</FormLabel>
                            <FormControl><Input placeholder="Ex: KHEOPS Collective" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="projectName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom du Projet</FormLabel>
                            <FormControl><Input placeholder="Ex: Chroniques de l'Aube" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Numéro de téléphone</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Ex: +242 06 123 4567" {...field} className="pl-10" />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl"><SlidersHorizontal className="text-accent w-7 h-7" /> Prestation & Type</CardTitle>
                    <CardDescription>Choisissez le type de projet et la prestation qui vous convient le mieux.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6 pt-2">
                    <FormField control={form.control} name="projectType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type de Projet</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {projectTypes.map((type) => (<SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="serviceId" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prestation désirée</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner une prestation" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {services.map((service) => (
                                        <SelectItem key={service.id} value={service.id}>
                                            <div className="flex items-center gap-2">
                                                {React.createElement(service.icon, { className: "w-4 h-4" })}
                                                <span>{service.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </CardContent>
            </Card>

            {projectType && (
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl"><CalendarIcon className="text-accent w-7 h-7" /> Planification</CardTitle>
                    <CardDescription>Sélectionnez les dates et créneaux pour vos enregistrements.</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                {projectType === 'single' ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Date de la session</FormLabel>
                                <Popover><PopoverTrigger asChild>
                                <FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                </Button></FormControl>
                                </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" locale={fr} selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus /></PopoverContent></Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="timeSlot" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Créneau Horaire</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner un créneau" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {availableTimeSlots.map((slot) => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <FormLabel>Nombre de titres</FormLabel>
                            <div className="flex items-center gap-2">
                                <Button type="button" size="icon" variant="outline" onClick={() => handleTrackCountChange(fields.length - 1)} disabled={fields.length <= 1}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Input
                                    type="number"
                                    className="w-16 text-center"
                                    value={fields.length}
                                    onChange={(e) => handleTrackCountChange(parseInt(e.target.value, 10))}
                                    min={1}
                                />
                                <Button type="button" size="icon" variant="outline" onClick={() => handleTrackCountChange(fields.length + 1)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="p-4 rounded-lg border border-border/70 bg-background/50 space-y-4">
                                <h4 className="font-semibold text-primary flex items-center gap-2"><Pencil className="w-4 h-4" /> Titre #{index + 1}</h4>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <FormField control={form.control} name={`tracks.${index}.name`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom du titre</FormLabel>
                                            <FormControl><Input placeholder={`Titre ${index + 1}`} {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name={`tracks.${index}.date`} render={({ field }) => (
                                       <FormItem className="flex flex-col">
                                            <FormLabel>Date</FormLabel>
                                            <Popover><PopoverTrigger asChild>
                                            <FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                                            </Button></FormControl>
                                            </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" locale={fr} selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus /></PopoverContent></Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name={`tracks.${index}.timeSlot`} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Créneau</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {availableTimeSlots.map((slot) => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
                </CardContent>
            </Card>
            )}

            <div className="flex justify-end">
                <Button size="lg" type="submit" className="font-bold w-full md:w-auto" disabled={!projectType}>
                    {projectType ? "Réserver la Session" : "Veuillez remplir le formulaire"}
                </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
