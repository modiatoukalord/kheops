

"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight, ShoppingCart, X } from "lucide-react";
import type { Content } from "@/components/admin/content-management";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import BookingChat from '@/components/hubs/booking-chat';
import { Booking } from '@/components/admin/booking-schedule';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/components/cart/cart-sheet';

interface WearHubProps {
    content: Content[];
    bookings: Booking[];
    onAddBooking: (booking: Omit<Booking, 'id' | 'status'>) => void;
    onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

type WearProduct = {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    imageUrls?: string[];
    hint: string;
    category?: string;
    summary?: string;
};


export default function WearHub({ content, bookings, onAddBooking, onAddToCart }: WearHubProps) {
  
  const [selectedProduct, setSelectedProduct] = useState<WearProduct | null>(null);
  const [isChatOpen, setChatOpen] = useState(false);
  const [chatPrefill, setChatPrefill] = useState<Partial<Booking>>({});
  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState('');
  const { toast } = useToast();

  const wearProducts: WearProduct[] = useMemo(() => 
    content
      .filter(c => c.type === 'Produit Wear' && c.status === 'Publié')
      .map((c, i) => ({
        id: c.id,
        name: c.title,
        price: Number(c.author),
        imageUrl: (c.imageUrls && c.imageUrls[0]) || `https://picsum.photos/seed/wear${i+1}/600/800`,
        imageUrls: c.imageUrls,
        hint: c.title.toLowerCase().split(' ').slice(0, 2).join(' '),
        category: c.wearCategory,
        summary: c.summary,
      })), [content]);

  const featuredProducts = wearProducts.slice(0, 5);

  const productsByCategory = useMemo(() => {
    const grouped: { [key: string]: typeof wearProducts } = {};
    wearProducts.forEach(product => {
      const category = product.category || 'Autres';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    });
    return grouped;
  }, [wearProducts]);

  const handleProductClick = (product: WearProduct) => {
    setSelectedProduct(product);
  };
  
  const handleBookingRequest = () => {
    if (!selectedProduct) return;
    setChatPrefill({
      projectName: selectedProduct.name,
      service: 'Achat',
      amount: selectedProduct.price,
    });
    setChatOpen(true);
    setSelectedProduct(null);
  };

  const handleImageClick = (imageUrl: string) => {
    setLightboxImageUrl(imageUrl);
    setLightboxOpen(true);
  };


  return (
    <div className="space-y-16">
      <header className="text-center space-y-4 py-8 md:py-12 bg-card rounded-lg">
        <h1 className="text-4xl md:text-6xl font-bold text-primary font-headline tracking-widest">
          KHEOPS WEAR
        </h1>
        <p className="mt-4 text-xl font-semibold text-foreground/80 max-w-2xl mx-auto">
          La fusion de l'héritage ancestral et du style urbain contemporain.
        </p>
        <Button size="lg">
            Découvrir la Collection <ArrowRight className="ml-2"/>
        </Button>
      </header>

      {featuredProducts.length > 0 && (
        <section>
          <h2 className="text-3xl font-semibold font-headline text-center mb-8">Nouveautés</h2>
          <Carousel
            opts={{
              align: "start",
              loop: featuredProducts.length > 3,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {featuredProducts.map((product, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1" onClick={() => handleProductClick(product)}>
                    <Card className="overflow-hidden border-border/50 group cursor-pointer">
                      <CardContent className="p-0">
                         <div className="aspect-[3/4] overflow-hidden">
                           <Image
                              src={product.imageUrl}
                              alt={`Image de ${product.name}`}
                              width={600}
                              height={800}
                              data-ai-hint={product.hint}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                         </div>
                         <div className="p-4 bg-card">
                           <h3 className="font-semibold text-lg">{product.name}</h3>
                           <p className="text-primary font-bold">{product.price.toLocaleString('fr-FR')} FCFA</p>
                         </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex"/>
            <CarouselNext className="hidden sm:flex"/>
          </Carousel>
        </section>
      )}

      {Object.keys(productsByCategory).length > 0 && (
        <section>
          <h2 className="text-3xl font-semibold font-headline text-center mb-8">Catégories</h2>
          <div className="space-y-12">
              {Object.entries(productsByCategory).map(([category, products]) => (
                  <div key={category}>
                    <h3 className="text-2xl font-semibold mb-6">{category}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div key={product.id} className="group cursor-pointer" onClick={() => handleProductClick(product)}>
                            <Card className="overflow-hidden border-border/50">
                                <Image
                                src={product.imageUrl}
                                alt={`Pochette de ${product.name}`}
                                width={600}
                                height={800}
                                className="object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={product.hint}
                                />
                            </Card>
                            <div className="mt-2 text-center md:text-left">
                                <p className="font-semibold text-foreground">{product.name}</p>
                                <p className="text-sm text-primary">{product.price.toLocaleString('fr-FR')} FCFA</p>
                            </div>
                            </div>
                        ))}
                    </div>
                  </div>
              ))}
          </div>
        </section>
      )}

       <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedProduct && (
            <>
                <DialogHeader className="p-6 pb-0 sr-only">
                    <DialogTitle>{selectedProduct.name}</DialogTitle>
                </DialogHeader>
                <div className="grid md:grid-cols-2 gap-0">
                    <div className="order-2 md:order-1 p-6 flex flex-col">
                        <div className="flex-grow">
                             <Badge variant="secondary" className="mb-2">{selectedProduct.category}</Badge>
                            <h2 className="text-3xl font-bold mb-2">{selectedProduct.name}</h2>
                            <p className="text-2xl font-bold text-primary mb-4">{selectedProduct.price.toLocaleString('fr-FR')} FCFA</p>
                            <p className="text-muted-foreground text-sm">
                                {selectedProduct.summary || "La description de ce produit est à venir. Contactez-nous pour plus d'informations."}
                            </p>
                        </div>
                        <DialogFooter className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button size="lg" variant="outline" onClick={() => onAddToCart({ id: selectedProduct.id, name: selectedProduct.name, price: selectedProduct.price, imageUrl: selectedProduct.imageUrl })}>
                                <ShoppingCart className="mr-2 h-5 w-5"/>
                                Ajouter au Panier
                            </Button>
                            <Button size="lg" className="w-full" onClick={handleBookingRequest}>
                                Réserver
                            </Button>
                        </DialogFooter>
                    </div>

                    <div className="order-1 md:order-2">
                        {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 ? (
                            <Carousel className="w-full">
                                <CarouselContent>
                                    {selectedProduct.imageUrls.map((url, index) => (
                                        <CarouselItem key={index} onClick={() => handleImageClick(url)} className="cursor-pointer">
                                            <div className="aspect-[3/4] overflow-hidden md:rounded-tr-lg">
                                                <Image src={url} alt={`Image ${index + 1} de ${selectedProduct.name}`} width={600} height={800} className="object-cover w-full h-full" />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                {selectedProduct.imageUrls.length > 1 && (
                                    <>
                                        <CarouselPrevious className="left-4" />
                                        <CarouselNext className="right-4" />
                                    </>
                                )}
                            </Carousel>
                        ) : (
                             <div className="aspect-[3/4] overflow-hidden md:rounded-tr-lg">
                                <Image src={selectedProduct.imageUrl} alt={`Image de ${selectedProduct.name}`} width={600} height={800} className="object-cover w-full h-full" />
                            </div>
                        )}
                    </div>
                </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isLightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-2 bg-transparent border-0 flex items-center justify-center">
            <DialogHeader className="sr-only">
                <DialogTitle>Image en plein écran</DialogTitle>
            </DialogHeader>
            <Image src={lightboxImageUrl} alt="Image en plein écran" layout="fill" objectFit="contain" className="p-4" />
        </DialogContent>
      </Dialog>

      <BookingChat 
        isOpen={isChatOpen} 
        onOpenChange={setChatOpen} 
        onBookingSubmit={onAddBooking}
        bookings={bookings}
        bookingType="culture"
        prefilledData={chatPrefill}
      />
    </div>
  );
}
