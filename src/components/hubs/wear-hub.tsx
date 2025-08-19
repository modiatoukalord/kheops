"use client";
import { Shirt } from 'lucide-react';

export default function WearHub() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="relative mb-8">
        <Shirt className="w-32 h-32 text-primary/30" strokeWidth={1} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Shirt className="w-20 h-20 text-primary" />
        </div>
      </div>
      <h1 className="text-6xl font-bold text-primary font-headline tracking-widest">
        KHEOPS WEAR
      </h1>
      <p className="mt-4 text-4xl font-semibold text-foreground/80 font-headline">
        PROCHAINEMENT
      </p>
      <p className="mt-2 max-w-md text-muted-foreground">
        Notre collection exclusive de vêtements inspirée par la fusion de l'héritage ancestral et du style urbain contemporain sera bientôt disponible.
      </p>
    </div>
  );
}
