'use server';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).rol !== 'jefe_turno') {
      return { error: 'No autorizado. Acción exclusiva de Jefatura.' };
    }

    const nombre = formData.get('nombre') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rol = formData.get('rol') as 'jefe_turno' | 'pañolero' | 'mecanico' | 'inspector';

    if (!nombre || !email || !password || !rol) {
      return { error: 'Todos los campos son obligatorios' };
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: 'El correo ya está registrado en el sistema' };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      id: uuidv4(),
      nombre,
      email,
      passwordHash,
      rol,
      activo: true,
    });

    revalidatePath('/dashboard/jefe');
    return { success: true };
  } catch (error) {
    return { error: 'Error interno del servidor al crear el usuario' };
  }
}