
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

const availableTimeSlots = ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"];

interface BookingChatProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onBookingSubmit: (data: BookingData) => void;
  bookings: Booking[];
}

type Message = {
  sender: 'bot' | 'user';
  content: string | JSX.Element;
  id: number;
};

const initialQuestions = [
  "Bonjour ! Je suis l'assistant de réservation KHEOPS. Pour commencer, quel est votre nom d'artiste ?",
  "Enchanté ! Quel est le nom de votre projet ?",
  "Super. Quel type de projet est-ce ?", // select: Single, Mixtape, Album
  "Quelle prestation vous intéresse ?", // select: Prise de voix, Prise de voix + Mix, Full-package
  "Quelle date vous arrangerait ?", // calendar
  "À quel créneau horaire ?", // select with disabled slots
  "Parfait. Un dernier détail : votre numéro de téléphone pour la confirmation ?",
  "Merci ! Votre demande de réservation a été enregistrée. Nous vous contacterons bientôt pour confirmer."
];

export default function BookingChat({ isOpen, onOpenChange, onBookingSubmit, bookings }: BookingChatProps) {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [formData, setFormData] = useState<Partial<BookingData>>({
    artistName: '',
    projectName: '',
    projectType: 'Autre',
    service: '',
    date: new Date(),
    timeSlot: '',
    phone: '',
    amount: 0,
  });
  const [inputValue, setInputValue] = useState('');
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMessages([{ sender: 'bot', content: initialQuestions[0], id: Date.now() }]);
      setStep(0);
      setFormData({
        artistName: '',
        projectName: '',
        projectType: 'Autre',
        service: '',
        date: new Date(),
        timeSlot: '',
        phone: '',
        amount: 0,
      });
    }
  }, [isOpen]);

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
    
    const currentStep = step;
    const newFormData = { ...formData };
    if (currentStep === 0) newFormData.artistName = answer;
    else if (currentStep === 1) newFormData.projectName = answer;
    else if (currentStep === 2) newFormData.projectType = answer;
    else if (currentStep === 3) newFormData.service = answer;
    else if (currentStep === 4) newFormData.date = new Date(answer);
    else if (currentStep === 5) newFormData.timeSlot = answer;
    else if (currentStep === 6) newFormData.phone = answer;
    setFormData(newFormData);

    const nextStep = currentStep + 1;
    if (nextStep < initialQuestions.length -1) {
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'bot', content: initialQuestions[nextStep], id: Date.now() + 1 }]);
        setStep(nextStep);
      }, 500);
    } else {
        const finalBookingData: BookingData = { 
            ...newFormData,
            amount: calculatePrice(newFormData.service as string, 1),
            tracks: [{ name: newFormData.projectName as string, date: newFormData.date as Date, timeSlot: newFormData.timeSlot as string }]
        } as BookingData;

        onBookingSubmit(finalBookingData);

        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'bot', content: initialQuestions[nextStep], id: Date.now() + 1 }]);
            setStep(nextStep);
             toast({
                title: "Réservation Envoyée !",
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
    if (step >= initialQuestions.length -1 ) return null;

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
      case 0:
      case 1:
      case 6:
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim()) handleNextStep(inputValue);
            }}
            className="flex items-center gap-2"
          >
            <Input
              type={step === 6 ? 'tel' : 'text'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Écrivez votre réponse..."
              autoFocus
            />
            <Button type="submit" size="icon" disabled={!inputValue.trim()}><Send className="h-4 w-4" /></Button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2">
            <Bot className="text-primary"/> Assistant de Réservation
          </DialogTitle>
          <DialogDescription>
            Répondez aux questions pour planifier votre session en studio.
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
             {step === initialQuestions.length -1 && (
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
