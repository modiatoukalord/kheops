
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function HumanResourcesManagement() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
             <div className="flex-shrink-0 bg-orange-500/20 text-orange-500 p-3 rounded-full">
                <Briefcase className="h-6 w-6" />
             </div>
             <div>
                <CardTitle>Gestion du Personnel</CardTitle>
                <CardDescription>Gérez les employés, les contrats de travail et les paies.</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Section en construction</h3>
                <p className="text-muted-foreground">La gestion des ressources humaines sera bientôt disponible ici.</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    