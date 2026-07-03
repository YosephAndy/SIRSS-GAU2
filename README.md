# 🚛 SIRSS-GAU (Cusco Smart Waste Management System)

**SIRS-GAU** (Sistema Inteligente de Recolección de Residuos Sólidos Segregados para la Gestión Ambiental Urbana) es una plataforma web inteligente orientada a optimizar la gestión de residuos sólidos en la ciudad imperial del **Cusco, Perú** mediante monitoreo en tiempo real, cálculo de rutas inteligentes, analítica urbana y gestión ambiental digital.

La plataforma centraliza las operaciones del servicio de limpieza municipal permitiendo interactuar a tres actores clave:
* **🏛️ ADMINISTRADOR**: Gestiona usuarios, conductores, camiones, rutas inteligentes, horarios, incidencias reportadas, alertas y tableros de analítica urbana.
* **🚛 CONDUCTOR**: Visualiza la ruta asignada en su jornada de trabajo, reporta incidencias de vía o mecánicas en tiempo real, y transmite su ubicación GPS.
* **👤 CIUDADANO**: Consulta horarios de recolección de su zona, monitorea la ubicación en vivo del camión recolector y reporta incidencias de acumulación de residuos de forma anónima.

---

## 🚀 Pasos para Ejecutar el Proyecto

Para levantar la aplicación localmente desde cero, sigue estos pasos en tu terminal:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/sirs-sgau.git
   cd sirs-sgau
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Copia la plantilla de variables de entorno local:
   ```bash
   cp .env.example .env
   ```
   *(El archivo `.env` ya viene configurado para enlazarse con el contenedor local de PostgreSQL en el puerto `6001`).*

4. **Levantar la base de datos (PostgreSQL en Docker):**
   Asegúrate de tener Docker Desktop iniciado y ejecuta:
   ```bash
   docker compose -f dev-tools/sgau-db/docker-compose.yml up -d
   ```

5. **Sincronizar las tablas y crear roles iniciales (Prisma):**
   Aplica las migraciones para crear la estructura de las tablas y luego ejecuta el seed para crear los roles obligatorios (ADMIN, DRIVER, CITIZEN):
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

7. **Acceso:**
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
