
'use server';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { lucia } from './session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Employee } from '@/components/admin/human-resources-management';
import { ActionResult } from 'next/dist/server/app-render/types';

export async function login(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const email = formData.get('email');
  if (typeof email !== 'string' || !email) {
    return { error: 'Email invalide.' };
  }
  const pin = formData.get('pin');
  if (typeof pin !== 'string' || pin.length < 4) {
    return { error: 'Code PIN invalide.' };
  }

  try {
    const q = query(collection(db, 'employees'), where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { error: 'Email ou code PIN incorrect.' };
    }

    const employeeDoc = querySnapshot.docs[0];
    const employee = { id: employeeDoc.id, ...employeeDoc.data() } as Employee;
    
    // Check PIN
    if (employee.pin !== pin) {
        return { error: 'Email ou code PIN incorrect.' };
    }
    
    // Check if admin
    const isAdmin = employee.department === 'Direction' || employee.department === 'Administration';
    if (!isAdmin) {
        return { error: "Vous n'avez pas les droits d'administrateur." };
    }

    const session = await lucia.createSession(employee.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return redirect('/');
  } catch (e: any) {
    if (e.message.includes('credential')) {
       return { error: 'Email ou code PIN incorrect.' };
    }
    return { error: 'Une erreur est survenue.' };
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


export async function validateRequest(): Promise<{ user: Employee | null; session: import('lucia').Session | null }> {
	const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
	if (!sessionId) {
		return {
			user: null,
			session: null
		};
	}

	const result = await lucia.validateSession(sessionId);
	try {
		if (result.session && result.session.fresh) {
			const sessionCookie = lucia.createSessionCookie(result.session.id);
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		}
		if (!result.session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		}
	} catch {}
	return result as { user: Employee | null; session: import('lucia').Session | null };
}

