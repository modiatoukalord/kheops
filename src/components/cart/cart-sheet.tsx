
"use client";

import { useState } from "react";
import Image from "next/image";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ShoppingCart, Send } from "lucide-react";
import BookingChat from "@/components/hubs/booking-chat";
import { Booking } from "@/components/admin/booking-schedule";

export type CartItem = {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
};

interface CartSheetProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    cartItems: CartItem[];
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    onCheckout: (booking: Omit<Booking, 'id' | 'status'>) => void;
}

export default function CartSheet({
    isOpen,
    onOpenChange,
    cartItems,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
}: CartSheetProps) {
    const [isChatOpen, setChatOpen] = useState(false);
    const [chatPrefill, setChatPrefill] = useState<Partial<Booking>>({});
    
    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleCheckout = () => {
        const projectDescription = cartItems.map(item => `${item.quantity}x ${item.name}`).join(', ');
        setChatPrefill({
            projectName: `Commande Panier: ${projectDescription.substring(0, 50)}...`,
            service: 'Achat Multiple',
            amount: totalAmount,
        });
        onOpenChange(false); // Close cart sheet
        setChatOpen(true); // Open chat
    }

    return (
        <>
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
                    <SheetHeader className="px-6">
                        <SheetTitle>Panier d'Achat</SheetTitle>
                        <SheetDescription>
                            Vérifiez les articles de votre panier avant de finaliser la commande.
                        </SheetDescription>
                    </SheetHeader>
                    <Separator />
                    {cartItems.length > 0 ? (
                        <>
                            <ScrollArea className="flex-1 px-6">
                                <div className="space-y-4 py-4">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="rounded-md object-cover aspect-square" />
                                            <div className="flex-1 space-y-1">
                                                <p className="font-medium leading-tight">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.price.toLocaleString('fr-FR')} FCFA</p>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <Input type="text" value={item.quantity} readOnly className="h-6 w-10 text-center" />
                                                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => onRemoveItem(item.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                            <SheetFooter className="px-6 py-4 bg-background border-t">
                                <div className="w-full space-y-4">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total:</span>
                                        <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                                    </div>
                                    <Button size="lg" className="w-full" onClick={handleCheckout}>
                                        Passer la commande
                                        <Send className="ml-2 h-4 w-4"/>
                                    </Button>
                                </div>
                            </SheetFooter>
                        </>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                             <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
                            <p className="text-lg font-semibold">Votre panier est vide</p>
                            <p className="text-muted-foreground">Parcourez la boutique pour trouver votre bonheur.</p>
                            <Button onClick={() => onOpenChange(false)}>Continuer vos achats</Button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
            <BookingChat 
                isOpen={isChatOpen} 
                onOpenChange={setChatOpen} 
                onBookingSubmit={onCheckout}
                bookings={[]} // Bookings not needed for this type of checkout
                bookingType="culture"
                prefilledData={chatPrefill}
            />
        </>
    );
}
