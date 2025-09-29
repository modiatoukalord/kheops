
'use server';

import type { Employee } from '@/components/admin/human-resources-management';
import { ActionResult } from 'next/dist/server/app-render/types';

export async function login(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
    return { error: 'La fonctionnalité de connexion est temporairement désactivée.' };
}

export async function logout(): Promise<ActionResult> {
    return { error: 'Non autorisé' };
}


export async function validateRequest(): Promise<{ user: Employee | null; session: any | null }> {
	return {
			user: null,
			session: null
	};
}
