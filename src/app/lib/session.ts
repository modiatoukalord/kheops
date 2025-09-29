
import { Lucia } from 'lucia';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// THIS IS A CUSTOM ADAPTER
const adapter = {
  getSessionAndUser: async (sessionId: string) => {
    const sessionDocRef = doc(db, 'sessions', sessionId);
    const sessionDoc = await getDoc(sessionDocRef);
    if (!sessionDoc.exists()) {
      return [null, null] as const;
    }
    const session = { id: sessionDoc.id, ...sessionDoc.data(), attributes: sessionDoc.data() };

    const userDocRef = doc(db, 'employees', session.userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      return [null, null] as const;
    }
    const user = { id: userDoc.id, ...userDoc.data(), attributes: userDoc.data() };
    
    // @ts-ignore
    return [session, user] as const;
  },
  
  deleteSession: async (sessionId: string) => {
    await deleteDoc(doc(db, 'sessions', sessionId));
  },

  deleteUserSessions: async (userId: string) => {
    // This is more complex, would need a query. Skipping for now.
  },

  setSession: async (session: any) => {
    await setDoc(doc(db, 'sessions', session.id), session);
  },

  updateSessionExpiration: async (sessionId: string, expiresAt: Date) => {
    await updateDoc(doc(db, 'sessions', sessionId), { expiresAt });
  },

  deleteExpiredSessions: async () => {
    // This is more complex, would need a query. Skipping for now.
  }
};


export const lucia = new Lucia(adapter as any, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
   getUserAttributes: (attributes) => {
    return {
      name: attributes.name,
      role: attributes.role,
      department: attributes.department,
    };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      name: string;
      role: string;
      department: string;
    };
  }
}
