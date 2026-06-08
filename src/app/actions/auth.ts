'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin-palm-2026';
const SESSION_COOKIE = 'palm_admin_session';

export async function loginAction(formData: FormData) {
    const password = formData.get('password') as string;

    if (password === ADMIN_PASSWORD) {
        const cookieStore = await cookies();
        cookieStore.set(SESSION_COOKIE, 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });
        return { success: true };
    }

    return { success: false, error: 'Invalid Access Code' };
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    redirect('/');
}

export async function checkAuth() {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE);
    return session?.value === 'true';
}
