# Apex Motors - Backend API

Backend desarrollado con **NestJS**, **Prisma 8 Composer**, **PostgreSQL** y **Zod**.

---

## 🚀 Cómo levantar el servidor

### 1. Requisito previo: Base de datos PostgreSQL
Asegurate de que PostgreSQL esté corriendo en el puerto `5432`.
Este comando crea el contenedor de doker con la bd
```bash
docker compose -f docker-compose.postgres.yml up -d
```

En caso de que la bd ya se encuentre creada para levantarla simplemenete ejecutar: 
```bash
docker start postgres-prisma
```

Actualmete quedo modificado para que al ejecutar  
```bash
npm run dev
```  
se levante la bd al mismo tiempo que el servidor del backend.

### 2. Iniciar el servidor en modo desarrollo
```bash
npm run dev
```
*Utiliza `tsx watch src/main.ts` con recarga en vivo (hot-reload).*
*El servidor escuchará en `http://localhost:3000` con CORS habilitado.*

### 3. Compilar para producción (Opcional)
```bash
npm run build
npm run start
```

---

## 🗄️ Comandos de Prisma 8 Composer

* **Actualizar el contrato de modelos** (luego de editar `src/prisma/contract.prisma`):
  ```bash
  npm run contract:emit
  ```

* **Crear / Actualizar tablas en la base de datos:**
  ```bash
  npm run db:init
  ```

* **Ver estado de migraciones:**
  ```bash
  npm run migration:status
  ```
