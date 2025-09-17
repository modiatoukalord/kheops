
"use client";

import { Pyramid } from "lucide-react";
import type { Contract } from "./contract-management";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ContractViewProps {
    contract: Contract;
}

export default function ContractView({ contract }: ContractViewProps) {
    const getDurationText = () => {
        if (contract.startDate && contract.endDate) {
            return `Du ${format(contract.startDate, "d MMMM yyyy", { locale: fr })} au ${format(contract.endDate, "d MMMM yyyy", { locale: fr })}`;
        }
        if (contract.startDate) {
            return `À partir du ${format(contract.startDate, "d MMMM yyyy", { locale: fr })}`;
        }
        return "Non spécifiée";
    }


    return (
        <div className="bg-white text-black p-12 printable-area">
            <style jsx global>{`
                @media print {
                    body {
                        background-color: white !important;
                    }
                    .printable-area {
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100%;
                        max-width: 100%;
                        box-shadow: none;
                        border: none;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
            <div className="max-w-4xl mx-auto font-serif">
                <header className="text-center mb-12">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Pyramid className="h-8 w-8 text-yellow-600" />
                        <h1 className="text-2xl font-bold tracking-wider">KHEOPS STUDIO</h1>
                    </div>
                    <h2 className="text-3xl font-bold tracking-wide">Contrat de {contract.type}</h2>
                </header>

                <section className="mb-8">
                    <h3 className="text-xl font-semibold border-b pb-2 mb-4">Informations Générales</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <p><strong>Le Prestataire :</strong> KHEOPS STUDIO</p>
                        <p><strong>Le Client :</strong> {contract.clientName}</p>
                        <p><strong>Date d'Effet :</strong> {contract.startDate ? format(contract.startDate, "d MMMM yyyy", { locale: fr }) : "N/A"}</p>
                        <p><strong>Durée du contrat :</strong> {getDurationText()}</p>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className="text-xl font-semibold border-b pb-2 mb-4">1. Objet du Contrat</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {contract.object || "Le présent contrat a pour objet de définir les conditions dans lesquelles KHEOPS STUDIO (le \"Prestataire\") fournira des services de production musicale et d'enregistrement au Client. Les services incluent, sans s'y limiter, la réservation de sessions de studio, la prise de voix, le mixage, le mastering et l'accompagnement artistique, conformément aux prestations détaillées en annexe ou convenues entre les parties."}
                    </p>
                </section>

                 <section className="mb-8">
                    <h3 className="text-xl font-semibold border-b pb-2 mb-4">2. Obligations des Parties</h3>
                     <div className="text-sm text-gray-700 space-y-2">
                        <p><strong>2.1. Obligations du Prestataire :</strong> <span className="whitespace-pre-wrap">{contract.obligationsProvider || "KHEOPS STUDIO s'engage à fournir les services avec diligence et professionnalisme, à mettre à disposition des équipements fonctionnels et un environnement de travail adéquat."}</span></p>
                        <p><strong>2.2. Obligations du Client :</strong> <span className="whitespace-pre-wrap">{contract.obligationsClient || "Le Client s'engage à respecter les horaires de réservation, à utiliser le matériel de manière appropriée et à effectuer les paiements selon les modalités convenues."}</span></p>
                    </div>
                </section>

                <section className="mb-8">
                    <h3 className="text-xl font-semibold border-b pb-2 mb-4">3. Durée et Conditions Financières</h3>
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <table className="w-full">
                            <tbody>
                                <tr className="border-b">
                                    <td className="py-2 pr-4 font-semibold">Montant Total de la Prestation</td>
                                    <td className="py-2 text-right font-bold text-lg">{contract.value.toLocaleString('fr-FR')} FCFA</td>
                                </tr>
                                <tr>
                                    <td className="py-2 pr-4 font-semibold">Statut du Paiement</td>
                                    <td className="py-2 text-right">{contract.paymentStatus}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                     <p className="text-xs text-gray-500 mt-2 whitespace-pre-wrap">
                        {contract.paymentTerms || "Sauf accord contraire, un acompte de 50% est requis à la signature du contrat. Le solde est dû à la livraison finale des masters. Tout retard de paiement pourra entraîner la suspension des services."}
                    </p>
                </section>
                
                <section className="mb-8">
                    <h3 className="text-xl font-semibold border-b pb-2 mb-4">4. Confidentialité</h3>
                     <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {contract.confidentiality || "Chaque partie s'engage à ne pas divulguer les informations confidentielles de l'autre partie, qu'il s'agisse d'informations techniques, commerciales ou financières, sans l'accord écrit préalable de cette dernière. Cette obligation de confidentialité survivra à l'expiration ou à la résiliation du présent contrat."}
                    </p>
                </section>

                <footer className="mt-24">
                    <div className="grid grid-cols-2 gap-16">
                        <div className="text-center">
                            <div className="border-t pt-2">
                                <p className="font-semibold">Pour KHEOPS STUDIO</p>
                                <p className="text-sm text-gray-600">{contract.signatoryName || "[Signature]"}</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t pt-2">
                                 <p className="font-semibold">Pour le Client</p>
                                <p className="text-sm text-gray-600">[{contract.clientName}]</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-500 mt-12">Fait à Brazzaville, le {format(new Date(), "d MMMM yyyy", { locale: fr })}</p>
                </footer>
            </div>
        </div>
    );
}

    