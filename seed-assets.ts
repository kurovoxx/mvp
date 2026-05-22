import * as dotenv from 'dotenv';
dotenv.config();
import { db } from './src/lib/db';
import { assets, users } from './src/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays } from 'date-fns';

async function seedAssets() {
  console.log('Seeding assets...');

  const assetData = [
    {
      nombre: 'Torquímetro Digital 1/2"',
      categoria: 'herramienta_precision' as const,
      nivelCriticidad: 'alta' as const,
      estado: 'disponible' as const,
      ubicacionFisica: 'Estante A-1',
      fechaUltimaCalibracion: subDays(new Date(), 30),
      fechaVencimientoCalibracion: addDays(new Date(), 335),
      vidaUtilEstimadaDias: 1095,
    },
    {
      nombre: 'Multímetro Fluke 87V',
      categoria: 'herramienta_precision' as const,
      nivelCriticidad: 'alta' as const,
      estado: 'disponible' as const,
      ubicacionFisica: 'Estante A-2',
      fechaUltimaCalibracion: subDays(new Date(), 360),
      fechaVencimientoCalibracion: addDays(new Date(), 5), // Próximo a vencer
      vidaUtilEstimadaDias: 1825,
    },
    {
      nombre: 'Micrómetro de Exteriores 0-25mm',
      categoria: 'herramienta_precision' as const,
      nivelCriticidad: 'media' as const,
      estado: 'bloqueada' as const, // Bloqueado por calibración vencida (simulado)
      ubicacionFisica: 'Estante A-3',
      fechaUltimaCalibracion: subDays(new Date(), 400),
      fechaVencimientoCalibracion: subDays(new Date(), 35), // Vencido
      vidaUtilEstimadaDias: 2000,
    },
    {
      nombre: 'Arnés de Seguridad 4 Argollas',
      categoria: 'epp' as const,
      nivelCriticidad: 'alta' as const,
      estado: 'disponible' as const,
      ubicacionFisica: 'Bodega EPP-1',
      fechaUltimaCalibracion: null,
      fechaVencimientoCalibracion: addDays(new Date(), 180),
      vidaUtilEstimadaDias: 365,
    },
    {
      nombre: 'Camión Extractor Komatsu 930E',
      categoria: 'equipo_mayor' as const,
      nivelCriticidad: 'alta' as const,
      estado: 'disponible' as const,
      ubicacionFisica: 'Patio de Equipos',
      fechaUltimaCalibracion: null,
      fechaVencimientoCalibracion: null,
      vidaUtilEstimadaDias: 3650,
    },
  ];

  for (const asset of assetData) {
    await db.insert(assets).values({
      id: uuidv4(),
      ...asset,
    }).onConflictDoNothing();
  }

  console.log('Assets seeded successfully.');
}

seedAssets().catch(console.error);
