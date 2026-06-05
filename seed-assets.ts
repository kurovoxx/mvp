import * as dotenv from 'dotenv';
dotenv.config();
import { db } from './src/lib/db';
import { assets } from './src/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { addDays, subDays } from 'date-fns';

async function seedAssets() {
  console.log('Seeding a large volume of assets with auto-blocking for expired ones...');

  const assetTemplates = [
    {
      nombre: 'Torquímetro Digital 1/2"',
      categoria: 'herramienta_precision' as const,
      nivelCriticidad: 'alta' as const,
      ubicacionFisica: 'Estante A-1',
      vidaUtilEstimadaDias: 1095,
      cantidad: 15,
      calibracionBase: (i: number) => {
        if (i < 3) return { last: subDays(new Date(), 360), expiry: subDays(new Date(), 5), estado: 'bloqueada' as const }; // 3 Vencidos -> BLOQUEADOS
        if (i < 6) return { last: subDays(new Date(), 10), expiry: addDays(new Date(), 5), estado: 'disponible' as const };  // 3 Por vencer
        return { last: subDays(new Date(), 30), expiry: addDays(new Date(), 335), estado: 'disponible' as const };           // 9 Al día
      }
    },
    {
      nombre: 'Multímetro Fluke 87V',
      categoria: 'herramienta_precision' as const,
      nivelCriticidad: 'alta' as const,
      ubicacionFisica: 'Estante A-2',
      vidaUtilEstimadaDias: 1825,
      cantidad: 8,
      calibracionBase: (i: number) => {
        if (i < 2) return { last: subDays(new Date(), 400), expiry: subDays(new Date(), 35), estado: 'bloqueada' as const }; // 2 Vencidos -> BLOQUEADOS
        return { last: subDays(new Date(), 100), expiry: addDays(new Date(), 265), estado: 'disponible' as const };          // 6 Al día
      }
    },
    {
      nombre: 'Arnés de Seguridad 4 Argollas',
      categoria: 'epp' as const,
      nivelCriticidad: 'alta' as const,
      ubicacionFisica: 'Bodega EPP-1',
      vidaUtilEstimadaDias: 365,
      cantidad: 20,
      calibracionBase: (i: number) => ({ last: subDays(new Date(), 50), expiry: addDays(new Date(), 315), estado: 'disponible' as const })
    },
    {
      nombre: 'Camión Extractor Komatsu 930E',
      categoria: 'equipo_mayor' as const,
      nivelCriticidad: 'alta' as const,
      ubicacionFisica: 'Patio de Equipos',
      vidaUtilEstimadaDias: 3650,
      cantidad: 5,
      calibracionBase: (i: number) => ({ last: subDays(new Date(), 180), expiry: addDays(new Date(), 185), estado: 'disponible' as const })
    },
    {
      nombre: 'Micrómetro de Exteriores 0-25mm',
      categoria: 'herramienta_precision' as const,
      nivelCriticidad: 'media' as const,
      ubicacionFisica: 'Estante A-3',
      vidaUtilEstimadaDias: 2000,
      cantidad: 10,
      calibracionBase: (i: number) => {
        if (i === 0) return { last: subDays(new Date(), 450), expiry: subDays(new Date(), 85), estado: 'bloqueada' as const }; // 1 Vencido -> BLOQUEADO
        return { last: subDays(new Date(), 20), expiry: addDays(new Date(), 345), estado: 'disponible' as const };             // 9 Al día
      }
    }
  ];

  for (const template of assetTemplates) {
    for (let i = 0; i < template.cantidad; i++) {
      const calib = template.calibracionBase(i);
      await db.insert(assets).values({
        id: uuidv4(),
        nombre: template.nombre,
        categoria: template.categoria,
        nivelCriticidad: template.nivelCriticidad,
        estado: calib.estado,
        ubicacionFisica: `${template.ubicacionFisica} / Slot ${i + 1}`,
        fechaUltimaCalibracion: calib.last,
        fechaVencimientoCalibracion: calib.expiry,
        vidaUtilEstimadaDias: template.vidaUtilEstimadaDias,
      });
    }
  }

  console.log('Extended assets with auto-blocking seeded successfully.');
}

seedAssets().catch(console.error);
