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
import { Music, Calendar as CalendarIcon, Clock, SlidersHorizontal, Mic, AudioLines, User, DiscAlbum, FileText, ListMusic } from "lucide-react";
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
  projectType: z.string({ required_error: "Veuillez choisir le type de projet." }),
  serviceId: z.string({ required_error: "Veuillez choisir une prestation." }),
  timeSlot: z.string().optional(),
  date: z.date().optional(),
  tracks: z.array(trackSchema).min(1, "Veuillez ajouter au moins un titre.")
}).superRefine((data, ctx) => {
    if (data.projectType === 'Single') {
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
    } else {
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
      tracks: [{ name: "" }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "tracks",
  });

  const onSubmit = (data: BookingFormValues) => {
    const selectedService = services.find(s => s.id === data.serviceId);
    let description = `Bonjour ${data.artistName}, votre session "${selectedService?.label}" pour le projet "${data.projectName}" (${data.projectType}) a été réservée.`;
    
    if (data.projectType === 'Single' && data.date && data.timeSlot) {
      description += ` Session unique le ${format(data.date, "PPP", { locale: fr })} de ${data.timeSlot}.`;
    } else {
        const trackDetails = data.tracks.map(t => `${t.name} (le ${t.date ? format(t.date, "PPP", { locale: fr }) : 'date non spécifiée'} à ${t.timeSlot || 'créneau non spécifié'})`).join('; ');
        description += ` Détails des sessions: ${trackDetails}.`;
    }

    toast({
        title: "Réservation confirmée !",
        description: description,
    });
    form.reset({
      serviceId: "voice-mix",
      artistName: "",
      projectName: "",
      tracks: [{ name: "" }],
      projectType: undefined,
      date: undefined,
      timeSlot: undefined,
    });
    replace([{ name: "" }]);
  };
  
  const selectedServiceId = form.watch("serviceId");
  const projectType = form.watch("projectType");

  const handleTrackCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10) || 0;
    const currentCount = fields.length;
    if (count > currentCount) {
        for (let i = 0; i < count - currentCount; i++) {
            append({ name: "" });
        }
    } else if (count < currentCount) {
        for (let i = 0; i < currentCount - count; i++) {
            remove(currentCount - 1 - i);
        }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="w-[90%] md:w-[75%] lg:w-[60%] mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Réserver le Studio</CardTitle>
          <CardDescription>
            Réservez votre session d'enregistrement au studio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="artistName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'artiste / Groupe</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'artiste" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du Projet</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du projet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de Projet</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type de projet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prestation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une prestation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex items-center space-x-2">
                              {React.createElement(service.icon, { className: "h-4 w-4" })}
                              <span>{service.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {projectType === "single" ? (
                <>
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de la session</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: fr })
                                ) : (
                                  <span>Choisir une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              locale={fr}
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date()
                              }
                              initialFocus
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
                        <FormLabel>Créneau</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un créneau" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTimeSlots.map((timeSlot) => (
                              <SelectItem key={timeSlot} value={timeSlot}>
                                {timeSlot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <FormLabel>Nombre de titres</FormLabel>
                    <Input
                      type="number"
                      defaultValue={fields.length.toString()}
                      onChange={handleTrackCountChange}
                      min="1"
                    />
                  </div>
                  <Separator className="my-2" />
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Titre #{index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                          <FormField
                            control={form.control}
                            name={`tracks.${index}.name` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom du titre</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nom du titre" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`tracks.${index}.date` as const}
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Date de la session</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-[240px] pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP", { locale: fr })
                                        ) : (
                                          <span>Choisir une date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      locale={fr}
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date < new Date()
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`tracks.${index}.timeSlot` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Créneau</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Sélectionner un créneau" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {availableTimeSlots.map((timeSlot) => (
                                      <SelectItem key={timeSlot} value={timeSlot}>
                                        {timeSlot}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </>
              )}
              <Button type="submit">Réserver</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
