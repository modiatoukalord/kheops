import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function BookingSchedule() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Planning des Réservations</CardTitle>
        <CardDescription>
          Consultez et gérez le calendrier des réservations du studio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Le planning des réservations sera bientôt disponible.</p>
      </CardContent>
    </Card>
  );
}
