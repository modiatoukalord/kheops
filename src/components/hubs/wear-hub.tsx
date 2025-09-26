
"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";
import type { Content } from "@/components/admin/content-management";

interface WearHubProps {
    content: Content[];
}

const staticCategories = [
  {
    name: "T-Shirts",
    imageUrl: "https://picsum.photos/seed/cat1/800/600",
    hint: "t-shirt collection"
  },
  {
    name: "Hoodies & Sweats",
    imageUrl: "https://picsum.photos/seed/cat2/800/600",
    hint: "hoodie streetwear"
  },
  {
    name: "Accessoires",
    imageUrl: "https://picsum.photos/seed/cat3/800/600",
    hint: "streetwear accessories"
  },
];

export default function WearHub({ content }: WearHubProps) {
  
  const wearProducts = useMemo(() => 
    content
      .filter(c => c.type === 'Produit Wear' && c.status === 'Publié')
      .map((c, i) => ({
        id: c.id,
        name: c.title,
        price: `${Number(c.author).toLocaleString('fr-FR')} FCFA`,
        imageUrl: c.imageUrl || `https://picsum.photos/seed/wear${i+1}/600/800`,
        hint: c.title.toLowerCase().split(' ').slice(0, 2).join(' '),
        category: c.wearCategory,
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
                  <div className="p-1">
                    <Card className="overflow-hidden border-border/50 group">
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
                           <p className="text-primary font-bold">{product.price}</p>
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
                            <div key={product.id} className="group">
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
                                <p className="text-sm text-primary">{product.price}</p>
                            </div>
                            </div>
                        ))}
                    </div>
                  </div>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}

    