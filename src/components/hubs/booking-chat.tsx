

"use client";

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Send, User, Calendar as CalendarIcon, Bot, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Booking } from '@/components/admin/booking-schedule';
import { servicesWithPrices, calculatePrice } from '@/lib/pricing';

type BookingData = Omit<Booking, 'id' | 'status'>;
type BookingType = 'studio' | 'culture' | 'wear';

const availableTimeSlots = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];

interface BookingChatProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onBookingSubmit: (data: BookingData) => void;
  bookings: Booking[];
  bookingType?: BookingType;
  prefilledData?: Partial<BookingData>;
}

type Message = {
  sender: 'bot' | 'user';
  content: string | JSX.Element;
  id: number;
};

const questions = {
  studio: [
    "Bonjour ! Je suis l'assistant KHEOPS. Pour commencer, quel est votre nom d'artiste ?", // 0
    "Enchanté ! Quel est le nom de votre projet ?", // 1
    "Super. Quel type de projet est-ce ?", // 2: select: Single, Mixtape, Album
    "Quelle prestation vous intéresse ?", // 3: select
    "Quelle date vous arrangerait pour commencer ?", // 4: calendar
    "À quel créneau horaire ?", // 5: select with disabled slots
    "Parfait. Un dernier détail : votre numéro de téléphone pour la confirmation ?", // 6
    "Merci ! Votre demande a été enregistrée. Nous vous contacterons bientôt." // 7
  ],
  culture: [
    "Bonjour ! Pour réserver ou acheter ce produit, quel est votre nom ?", // 0
    "Parfait ! Quel est votre numéro de téléphone pour la confirmation ?", // 1
    "Merci ! Votre demande a été enregistrée. Nous vous contacterons bientôt." // 2
  ],
  wear: [
    "Bonjour ! Pour commander ce produit, quel est votre nom ?", // 0
    "Parfait ! Quel est votre numéro de téléphone pour la confirmation ?", // 1
    "Merci ! Votre commande a été enregistrée. Nous vous contacterons bientôt." // 2
  ]
};

export default function BookingChat({ 
    isOpen, 
    onOpenChange, 
    onBookingSubmit, 
    bookings, 
    bookingType = 'studio',
    prefilledData = {}
}: BookingChatProps) {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [formData, setFormData] = useState<Partial<BookingData>>({});
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const initialQuestions = questions[bookingType];

  useEffect(() => {
    if (isOpen) {
      setMessages([{ sender: 'bot', content: initialQuestions[0], id: Date.now() }]);
      setStep(0);
      setFormData({
        ...prefilledData,
        date: prefilledData.date || new Date(),
      });
      setInputValue('');
    }
  }, [isOpen, bookingType, prefilledData]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom.
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if(viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);


  const handleNextStep = (answer: any, displayAnswer?: string | JSX.Element) => {
    const userMessageContent = displayAnswer || answer;
    setMessages(prev => [...prev, { sender: 'user', content: userMessageContent, id: Date.now() }]);
    
    let currentStep = step;
    const newFormData = { ...formData };
    
    if (bookingType === 'studio') {
        switch (currentStep) {
            case 0: newFormData.artistName = answer; break;
            case 1: newFormData.projectName = answer; break;
            case 2: newFormData.projectType = answer; break;
            case 3: newFormData.service = answer; break;
            case 4: newFormData.date = new Date(answer); break;
            case 5: newFormData.timeSlot = answer; break;
            case 6: newFormData.phone = answer; break;
        }
    } else { // culture or wear booking
        switch (currentStep) {
            case 0: newFormData.artistName = answer; break;
            case 1: newFormData.phone = answer; break;
        }
    }
    setFormData(newFormData);

    let nextStep = currentStep + 1;
    
    if (bookingType === 'studio' && currentStep === 4 && newFormData.projectType !== 'Single') {
      nextStep = 6; // Skip timeslot question for non-singles
    }
    
    if (nextStep < initialQuestions.length -1) {
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bot', content: initialQuestions[nextStep], id: Date.now() + 1 }]);
        setStep(nextStep);
      }, 500);
    } else {
        const finalBookingData: BookingData = { 
            projectType: bookingType,
            ...newFormData,
            amount: bookingType === 'studio' ? calculatePrice(newFormData.service as string, 1) : (prefilledData.amount || 0),
            tracks: bookingType === 'studio' ? [{ name: newFormData.projectName as string, date: newFormData.date as Date, timeSlot: newFormData.timeSlot as string }] : [],
            date: newFormData.date || new Date(),
            service: newFormData.service || 'Emprunt/Achat',
            timeSlot: newFormData.timeSlot || 'N/A'
        } as BookingData;

        onBookingSubmit(finalBookingData);

        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'bot', content: initialQuestions[initialQuestions.length -1], id: Date.now() + 1 }]);
            setStep(nextStep);
             toast({
                title: "Demande Envoyée !",
                description: "Nous avons bien reçu votre demande. Confirmation à venir.",
            });
        }, 500);

        setTimeout(() => onOpenChange(false), 3000);
    }
    setInputValue('');
  };
  
  const getBookedSlotsForDate = (date: Date) => {
    return bookings
      .filter(booking => isSameDay(booking.date, date) && booking.status !== 'Annulé')
      .map(booking => booking.timeSlot);
  };

  const bookedSlots = formData.date ? getBookedSlotsForDate(formData.date) : [];

  const renderCurrentInput = () => {
    if (step >= initialQuestions.length - 1 ) return null;

    if (bookingType === 'studio') {
        switch (step) {
        case 2: // Project Type
            return (
            <Select onValueChange={(value: Booking['projectType']) => handleNextStep(value)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Choisir un type..." /></SelectTrigger>
                <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Mixtape">Mixtape</SelectItem>
                <SelectItem value="Album">Album</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
            </Select>
            );
        case 3: // Service
            return (
            <Select onValueChange={(value) => handleNextStep(value)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Choisir une prestation..." /></SelectTrigger>
                <SelectContent>
                {Object.keys(servicesWithPrices).map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                ))}
                </SelectContent>
            </Select>
            );
        case 4: // Date
            return (
            <Popover>
                <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                        if (date) {
                            const displayDate = <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4"/><span>{format(date, "PPP", { locale: fr })}</span></div>;
                            handleNextStep(date.toISOString(), displayDate);
                        }
                    }}
                    initialFocus
                    locale={fr}
                />
                </PopoverContent>
            </Popover>
            );
        case 5: // Time Slot
            return (
            <Select
                onValueChange={(value) => handleNextStep(value)}
            >
                <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un créneau..." />
                </SelectTrigger>
                <SelectContent>
                {availableTimeSlots.map((slot) => (
                    <SelectItem
                    key={slot}
                    value={slot}
                    disabled={bookedSlots.includes(slot)}
                    >
                    {slot} {bookedSlots.includes(slot) && "(Indisponible)"}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            );
        }
    }

    // Default text input for other steps or 'culture'/'wear' booking type
    const isTel = (bookingType === 'studio' && step === 6) || ((bookingType === 'culture' || bookingType === 'wear') && step === 1);
    
    return (
        <form
            onSubmit={(e) => {
            e.preventDefault();
            if (inputValue.trim()) handleNextStep(inputValue);
            }}
            className="flex items-center gap-2"
        >
            <Input
                type={isTel ? 'tel' : 'text'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Écrivez votre réponse..."
                autoFocus
            />
            <Button type="submit" size="icon" disabled={!inputValue.trim()}><Send className="h-4 w-4" /></Button>
        </form>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="text-primary"/> Assistant de Réservation
          </DialogTitle>
          <DialogDescription>
            {bookingType !== 'studio' && formData.projectName ? `Pour "${formData.projectName}". ` : ''}
            Répondez aux questions pour planifier votre session ou commande.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-80 w-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex items-end gap-2", msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
                {msg.sender === 'bot' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">K</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-xs rounded-lg px-3 py-2 text-sm",
                    msg.sender === 'bot' ? 'bg-secondary' : 'bg-primary text-primary-foreground'
                  )}
                >
                  {msg.content}
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                     <AvatarFallback><User/></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {step >= initialQuestions.length - 1 && (
                 <div className="flex items-end gap-2 justify-start">
                     <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">K</AvatarFallback>
                     </Avatar>
                     <div className="max-w-xs rounded-lg px-3 py-2 text-sm bg-secondary">
                        <div className="flex items-center gap-2 font-medium">
                           <CheckCircle className="h-5 w-5 text-green-500" />
                           Demande envoyée !
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Nous vous contacterons sur le numéro {formData.phone} pour finaliser la réservation.</p>
                     </div>
                 </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
            {renderCurrentInput()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
