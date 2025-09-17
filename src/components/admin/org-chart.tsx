
"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Building, MicVocal, Palette, ShoppingBag } from "lucide-react";

type OrgMember = {
    name: string;
    role: string;
    avatar: string;
    icon: React.ElementType;
};

const orgData = {
    direction: { name: "Direction Générale", role: "CEO", avatar: "/avatars/ceo.png", icon: User },
    departments: [
        { 
            name: "Administration", 
            icon: Building,
            lead: { name: "Fatou Diop", role: "Manager du Hub", avatar: "/avatars/admin.png", icon: User },
            members: [
                { name: "Amadou Sow", role: "Comptable", avatar: "/avatars/compta.png", icon: User },
            ]
        },
        { 
            name: "Studio KHEOPS", 
            icon: MicVocal,
            lead: { name: "Moussa Traoré", role: "Ingénieur du Son Principal", avatar: "/avatars/studio.png", icon: User },
            members: [
                { name: "Binta Keita", role: "Assistant Ingénieur", avatar: "/avatars/assist.png", icon: User },
                { name: "Alioune Gueye", role: "Beatmaker", avatar: "/avatars/beatmaker.png", icon: User },
            ]
        },
        { 
            name: "Culture Hub", 
            icon: Palette,
            lead: { name: "Aïcha Diallo", role: "Responsable Contenu", avatar: "/avatars/culture.png", icon: User },
            members: [
                 { name: "Daouda Ndiaye", role: "Modérateur Communauté", avatar: "/avatars/modo.png", icon: User },
            ]
        },
        {
            name: "KHEOPS Wear",
            icon: ShoppingBag,
            lead: { name: "Issa Cissokho", role: "Chef de Produit", avatar: "/avatars/wear.png", icon: User },
            members: []
        }
    ]
};

const MemberCard = ({ member }: { member: OrgMember }) => (
    <Card className="text-center p-4 bg-card/60 shadow-md">
        <Avatar className="mx-auto h-16 w-16 mb-2 border-2 border-primary">
            <AvatarFallback className="bg-primary/20 text-primary">{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="font-bold text-sm">{member.name}</p>
        <p className="text-xs text-muted-foreground">{member.role}</p>
    </Card>
);

export default function OrgChart() {
    return (
        <div className="space-y-12">
            <Card>
                <CardHeader>
                    <CardTitle>Organigramme de KHEOPS</CardTitle>
                    <CardDescription>Structure organisationnelle et hiérarchique de l'entreprise.</CardDescription>
                </CardHeader>
            </Card>

            <div className="flex flex-col items-center">
                {/* Direction */}
                <div className="relative">
                    <MemberCard member={orgData.direction} />
                     <div className="absolute top-full left-1/2 w-0.5 h-8 bg-border -translate-x-1/2" />
                </div>
                
                {/* Connecting Line to Departments */}
                <div className="w-4/5 h-0.5 bg-border mt-8" />

                {/* Departments */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full mt-[-1px] relative">
                    {orgData.departments.map((dept, index) => (
                        <div key={index} className="flex flex-col items-center p-4">
                            {/* Vertical line connecting to the main horizontal line */}
                            <div className="w-0.5 h-8 bg-border" />
                            
                            {/* Department Head */}
                            <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
                                <dept.icon className="h-5 w-5 text-accent"/>
                                <h3>{dept.name}</h3>
                            </div>
                            <MemberCard member={dept.lead} />

                             {/* Vertical line connecting to members */}
                            {dept.members.length > 0 && <div className="w-0.5 h-8 bg-border mt-4" />}

                            {/* Department Members */}
                            <div className="space-y-4 mt-4">
                                {dept.members.map((member, mIndex) => (
                                    <MemberCard key={mIndex} member={member} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

