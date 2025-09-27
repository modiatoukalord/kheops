

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Truck, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Booking } from "@/components/admin/booking-schedule";

const bookingStatusConfig = {
  "Confirmé": { variant: "default", icon: CheckCircle2, color: "text-green-500" },
  "En attente": { variant: "secondary", icon: Clock, color: "text-yellow-500" },
  "Annulé": { variant: "destructive", icon: XCircle, color: "text-red-500" },
  "Payé": { variant: "default", icon: CheckCircle2, color: "bg-green-500/80 text-white" },
  "Expédiée": { variant: "default", icon: CheckCircle2, color: "bg-blue-500/80 text-white" },
};

interface WearOrdersProps {
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, newStatus: Booking['status']) => void;
}

export default function WearOrders({ bookings, onUpdateBookingStatus }: WearOrdersProps) {
  const { toast } = useToast();

  const wearOrders = useMemo(() => 
    bookings.filter(b => b.projectType === 'Wear')
            .sort((a, b) => b.date.getTime() - a.date.getTime()), 
  [bookings]);

  const handleStatusChange = (bookingId: string, newStatus: Booking['status']) => {
    onUpdateBookingStatus(bookingId, newStatus);
    toast({
      title: "Statut de la commande mis à jour",
      description: `La commande a été marquée comme "${newStatus}".`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des Commandes Wear</CardTitle>
        <CardDescription>Suivez et gérez les commandes passées depuis la boutique Wear.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Commande</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="text-center">Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wearOrders.length > 0 ? (
              wearOrders.map((order) => {
                const statusInfo = bookingStatusConfig[order.status];
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.artistName}</div>
                      <div className="text-xs text-muted-foreground">{order.phone}</div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{order.projectName}</TableCell>
                    <TableCell>{format(order.date, "d MMM yyyy", { locale: fr })}</TableCell>
                    <TableCell className="text-right font-semibold">{order.amount.toLocaleString('fr-FR')} FCFA</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={statusInfo.variant} className={order.status === 'Payé' || order.status === 'Expédiée' ? statusInfo.color : ''}>
                         <statusInfo.icon className={`mr-1.5 h-3 w-3 ${order.status !== 'Payé' && order.status !== 'Expédiée' ? statusInfo.color : ''}`} />
                         {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Confirmé')}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                            Confirmer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Payé')}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                             Marquer comme Payée
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Expédiée')}>
                            <Truck className="mr-2 h-4 w-4 text-blue-500" />
                            Marquer comme Expédiée
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500" onClick={() => handleStatusChange(order.id, 'Annulé')}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Annuler
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucune commande pour le moment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
