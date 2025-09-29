
import { Lucia } from 'lucia';
import { FirestoreAdapter } from 'oslo/adapter-firebase';
import { db } from './firebase';
import { cache } from 'react';

const adapter = new FirestoreAdapter(db.collection('sessions'), db.collection('users'));

export const lucia = new Lucia(adapter, {
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
