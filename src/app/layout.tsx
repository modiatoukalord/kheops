
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { validateRequest } from '@/app/lib/auth-actions';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';


export const metadata: Metadata = {
  title: 'KHEOPS – Écosystème Culturel & Créatif',
  description: 'Une plateforme pour la culture, la musique et la mode.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await validateRequest();
  let fullUser = null;
  if (user) {
    const userDoc = await getDoc(doc(db, "employees", user.id));
    if (userDoc.exists()) {
        fullUser = { id: userDoc.id, ...userDoc.data() };
    }
  }

  // Pass user to children; for client components, this needs to be handled via props.
  // For server components, we can just pass it. For page.tsx, we need to adapt it.
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // @ts-ignore
      return React.cloneElement(child, { user: fullUser });
    }
    return child;
  });

  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FFC107" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        {childrenWithProps}
        <Toaster />
      </body>
    </html>
  );
}
