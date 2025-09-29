// This file is temporarily disabled to resolve a package installation issue.
// The authentication system needs to be re-implemented.

// import { Lucia } from 'lucia';
// import { FirestoreAdapter } from '@lucia-auth/adapter-firebase';
// import { db } from '@/lib/firebase';
// import { collection } from 'firebase/firestore';

// const adapter = new FirestoreAdapter(collection(db, 'sessions'), collection(db, 'employees'));

// export const lucia = new Lucia(adapter, {
//   sessionCookie: {
//     expires: false,
//     attributes: {
//       secure: process.env.NODE_ENV === 'production',
//     },
//   },
//    getUserAttributes: (attributes) => {
//     return {
//       name: attributes.name,
//       role: attributes.role,
//       department: attributes.department,
//     };
//   },
// });

// declare module 'lucia' {
//   interface Register {
//     Lucia: typeof lucia;
//     DatabaseUserAttributes: {
//       name: string;
//       role: string;
//       department: string;
//     };
//   }
// }

export {}
