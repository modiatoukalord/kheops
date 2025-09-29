
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { login } from '@/app/lib/auth-actions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KeyRound, Mail, Pyramid } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [state, formAction] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
                <Pyramid className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl font-headline tracking-wider">KHEOPS</CardTitle>
            </div>
          <CardDescription>Accès réservé aux administrateurs</CardDescription>
        </CardHeader>
        <form action={formAction}>
            <CardContent className="space-y-4">
                 <Alert variant="destructive">
                    <AlertDescription>Le système de connexion est temporairement désactivé en raison d'un problème technique. Impossible de se connecter pour le moment.</AlertDescription>
                </Alert>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" name="email" type="email" placeholder="admin@kheops.com" required className="pl-10" disabled />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="pin">Code PIN</Label>
                     <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="pin" name="pin" type="password" required className="pl-10" disabled />
                    </div>
                </div>
                {state?.error && (
                <Alert variant="destructive">
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
                )}
            </CardContent>
            <CardFooter>
                <LoginButton />
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={true || pending}>
      {pending ? 'Connexion...' : 'Connexion Désactivée'}
    </Button>
  );
}
