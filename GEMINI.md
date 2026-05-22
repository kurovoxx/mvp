# Gestión de Activos Críticos - Faena Minera

Este archivo contiene el estado actual del proyecto, la arquitectura establecida y las reglas de negocio implementadas para asegurar la continuidad del desarrollo.

## Arquitectura y Stack
- **Framework:** Next.js 15+ (App Router, TypeScript).
- **Base de Datos:** Turso (SQLite/LibSQL) via Drizzle ORM.
- **Estilos:** Tailwind CSS (Mobile-first).
- **Autenticación:** NextAuth.js (JWT Strategy) con roles: `jefe_turno`, `pañolero`, `mecanico`, `inspector`.
- **Lógica de Servidor:** Server Actions para mutaciones y revalidación de caché.

## Estado de Funcionalidades (MVP)
- [x] **Autenticación:** Login funcional y redirección por rol.
- [x] **Inventario Agrupado:** Vista eficiente por tipos de activos, con detalle expandible.
- [x] **Flujo de Préstamo:** 
    - [x] Solicitud por Mecánico (filtrando activos vencidos).
    - [x] **Confirmación Visual Obligatoria:** El mecánico debe dar el visto bueno físico antes que el pañolero apruebe.
    - [x] Aprobación por Pañolero (solo tras confirmación del mecánico).
- [x] **Flujo de Devolución:** 
    - [x] Reporte de fallos por Mecánico.
    - [x] Recepción en Pañol con derivación automática a evaluación si hay daños.

## Reglas de Negocio Implementadas
1. **Bloqueo por Calibración:** Herramientas con fecha de vencimiento menor a hoy no aparecen en la lista de solicitudes.
2. **Doble Validación:** Un préstamo solo se activa (`en_uso`) si el mecánico confirma inspección Y el pañolero aprueba la salida.
3. **Cierre de Ciclo:** El préstamo solo se considera validado si el pañolero acepta la devolución sin daños.

## Tareas Pendientes
1. **Rol Inspector:** Implementar la cola de evaluación técnica y dictámenes (reincorporar, mantención, baja).
2. **Alertas Automáticas:** Alertas de calibración próxima (30, 15, 5 días).
3. **Panel Administrativo (Jefe):** Gestión de usuarios (crear/desactivar) y reporte histórico total.

## Credenciales de Prueba (Seed)
- Jefe: `jefe@faena.cl` / `password123`
- Pañolero: `panolero@faena.cl` / `password123`
- Mecánico: `mecanico@faena.cl` / `password123`
- Inspector: `inspector@faena.cl` / `password123`
