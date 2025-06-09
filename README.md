# Softtek - Prueba Técnica

## Levantar los servicios

### Variables de entorno

**fn-merge:**

```bash
LIBSQL_DB_URI=
LIBSQL_DB_TOKEN=

CACHE_DYNAMODB_TABLE_NAME=

AWS_REGION=
AWS_ACCESS_KEY=
AWS_SECRET_ACCESS_KEY=
```

**fn-history:**

```bash
LIBSQL_DB_URI=
LIBSQL_DB_TOKEN=
```

**fn-save:**

```bash
LIBSQL_DB_URI=
LIBSQL_DB_TOKEN=
```

### Usar versión de node

```bash
nvm use
```

### Instalar dependencias

```bash
pnpm install --frozen-lockfile
```

### Correr en desarrollo

```bash
pnpm dev
```

### Build al repositorio

```bash
pnpm build
```

### Correr en producción

```bash
pnpm start
```

### Correr test

```bash
pnpm test
```
