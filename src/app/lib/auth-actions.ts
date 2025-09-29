
'use server';

import { cookies } from 'next/headers';
import { lucia } from './session';
import { redirect } from 'next/navigation';
import { ActionResult } from 'next/dist/server/app-render/types';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Employee } from '@/components/admin/human-resources-management';
import {NextResponse} from 'next/server';

export async function login(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email');
  const pin = formData.get('pin');

  if (typeof email !== 'string' || !email) {
    return { error: 'Email invalide' };
  }
  if (typeof pin !== 'string' || pin.length < 4) {
    return { error: 'Code PIN invalide' };
  }

  // Backdoor for admin access
  if (email === 'admin@kheops.com' && pin === '0000') {
    const user = {
      id: 'admin',
      name: 'Admin KHEOPS',
      role: 'Directeur',
      department: 'Direction',
    };
    const session = await lucia.createSession(user.id, user);
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return redirect('/');
  }

  try {
    const q = query(collection(db, 'employees'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { error: 'Email ou code PIN incorrect' };
    }

    const userDoc = querySnapshot.docs[0];
    const user = {id: userDoc.id, ...userDoc.data()} as Employee;

    // In a real app, you should hash and verify the PIN.
    // For this project, we are doing a direct comparison.
    const validPin = user.pin === pin;

    if (!validPin) {
      return { error: 'Email ou code PIN incorrect' };
    }

    const session = await lucia.createSession(userDoc.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return redirect('/');
  } catch (e: any) {
    return {
      error: 'Une erreur est survenue. Veuillez réessayer.',
    };
  }
}

export async function logout(): Promise<ActionResult> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: 'Non autorisé',
    };
  }

  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
  return redirect('/login');
}

export async function validateRequest(): Promise<{ user: any; session: import('lucia').Session | null }> {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {}

  // Handle backdoor admin user
  if (result.user?.id === 'admin') {
      return {
          user: {
              id: 'admin',
              name: 'Admin KHEOPS',
              role: 'Directeur',
              department: 'Direction',
          },
          session: result.session,
      };
  }


  if (!result.user) {
     return {
      user: null,
      session: result.session
    };
  }
  
  // We fetch the full user data from Firestore using the userId from the lucia session
  const userDoc = await getDoc(doc(db, 'employees', result.user.id));
  if (!userDoc.exists()) {
    return {
      user: null,
      session: result.session,
    };
  }

  return {
    user: { id: userDoc.id, ...userDoc.data() } as Employee,
    session: result.session
  };
}
