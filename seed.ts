import * as dotenv from 'dotenv';
dotenv.config();
import { db } from './src/lib/db';
import { users } from './src/lib/db/schema';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  console.log('Seeding initial users...');

  const roles = [
    { nombre: 'Admin Jefe', email: 'jefe@faena.cl', rol: 'jefe_turno' },
    { nombre: 'Pañolero Uno', email: 'panolero@faena.cl', rol: 'pañolero' },
    { nombre: 'Mecanico Uno', email: 'mecanico@faena.cl', rol: 'mecanico' },
    { nombre: 'Inspector Uno', email: 'inspector@faena.cl', rol: 'inspector' },
  ] as const;

  for (const role of roles) {
    const passwordHash = await bcrypt.hash('password123', 10);
    await db.insert(users).values({
      id: uuidv4(),
      nombre: role.nombre,
      email: role.email,
      passwordHash,
      rol: role.rol,
      activo: true,
    }).onConflictDoNothing();
  }

  console.log('Seed completed. Passwords are: password123');
}

seed().catch(console.error);
