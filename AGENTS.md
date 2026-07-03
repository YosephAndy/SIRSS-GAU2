<!-- BEGIN:nextjs-agent-rules -->
# SIRS-SGAU Agent Rules

Este archivo define las reglas reales para el proyecto `sirs-sgau`. Sigue estas convenciones para mantener coherencia con la arquitectura y las decisiones ya adoptadas en el repo.

## Visión general del proyecto
- Proyecto: SIRS-SGAU, aplicación universitaria de gestión de debate y actividades.
- Arquitectura: Feature-Based Architecture aplicada a Next.js App Router.
- Objetivo: servidor primero, lógica de negocio en `src/features/`, UI ligera en `app/`.

## Stack real del repo
- Framework: Next.js App Router (Next 16)
- Lenguaje: TypeScript
- Base de datos: Prisma + PostgreSQL
- Autenticación: `next-auth` (Credentials / JWT) via `app/api/auth/[...nextauth]/route.ts`
- Validación: Zod
- State management: Zustand solo para estado de UI local/transitorio
- Data fetching: Server Components y SWR para revalidación cliente
- Mutaciones internas: Server Actions cuando sea posible
- Endpoints públicos/auth: API Routes cuando se requiere compatibilidad externa

## Reglas de arquitectura

### 1. Estructura feature-local
Organiza la lógica por dominio dentro de `src/features/`.
- `src/features/[feature]/components/`: UI específica de la feature
- `src/features/[feature]/screens/`: pantallas o vistas de la feature
- `src/features/[feature]/actions/`: Server Actions y mutaciones internas
- `src/features/[feature]/schemas/`: esquemas Zod para validación
- `src/features/[feature]/store/`: slices de Zustand para UI local
- `src/features/[feature]/types/`: tipos TS específicos del dominio

### 2. Server-first y límites reales
- Prefiere Server Components en `app/` y `src/features/` para consultas de datos.
- Usa Prisma directamente desde el servidor: `lib/prisma.ts`.
- Valida siempre los datos entrantes con Zod antes de usar Prisma.
- No almacenes entidades de base de datos en Zustand.
- Usa Server Actions para mutaciones internas entre componentes del servidor.
- Usa API Routes cuando la operación sea pública o necesite soporte para clientes externos (autenticación, webhooks, endpoints públicos).

### 3. Autenticación y autorización
- El proyecto actual usa `next-auth` para autenticación.
- La ruta principal de auth es `app/api/auth/[...nextauth]/route.ts`.
- Verifica sesión/usuario antes de cualquier operación que modifique la DB.
- Usa helpers compartidos en `lib/` para sesión y permisos cuando existan.

## Estándares de código

### Estilo
- Indentación: 2 espacios
- Componentes: PascalCase
- Funciones/variables: camelCase
- Evita `any` siempre que puedas.
- Prioriza soluciones nativas de Next.js antes de sumar dependencias.

### Tipado y validación
- Usa tipos de Prisma generados o interfaces explícitas.
- Usa Zod para validar formularios y Server Actions.
- Usa `react-hook-form` + `zodResolver` para formularios si corresponde.
- Usa template literals para cadenas dinámicas.

### Comentarios
- Usa JSDoc en lógica compleja.
- Comenta el "por qué" más que el "qué".

## Rutas y carpetas clave
- `app/`: App Router, rutas y layouts. Mantén el markup limpio y delega la lógica a `features`.
- `components/ui/`: componentes UI reutilizables.
- `lib/`: singletons y helpers compartidos (`prisma`, validaciones, sesión).
- `hooks/`: hooks reutilizables globales a nivel de raíz.
- `src/features/`: dominio de negocio.

## Flujo operativo para cambios
1. Localiza el dominio en `src/features/`.
2. Si cambias datos, crea un esquema Zod en `schemas/`.
3. Implementa Server Action en `actions/` con `'use server'`.
4. Protege con sesión si es una mutación privada.
5. Retorna respuesta consistente: `{ success, message?, fieldErrors?, data? }`.
6. Si la mutación es pública o auth-related, usa API Route en `app/api/`.

## Validaciones mínimas
1. `tsc --noEmit`
2. Verificar session/auth en cualquier acción que escriba en DB
3. Revisar que las rutas dinámicas usan metadata si es necesario

## Notas de compatibilidad
- Se permite API Routes para auth y endpoints públicos externos.
- Se prefiere Server Actions para lógica interna y comunicación entre componentes del servidor.
- Mantén `src/features/` como fuente de verdad del dominio; evita dispersar lógica en `src/services/` sin feature propia.

<!-- END:nextjs-agent-rules -->
