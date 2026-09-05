-- Esquema del sistema de administración
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query

create extension if not exists "pgcrypto";

create table if not exists departamentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null unique,
  password_hash text not null,
  rol text not null check (rol in ('admin', 'gerente', 'empleado')),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists empleados (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuarios(id) on delete set null,
  departamento_id uuid references departamentos(id) on delete set null,
  nombre text not null,
  puesto text,
  salario numeric(12, 2),
  fecha_ingreso date,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_usuarios_email on usuarios (email);
create index if not exists idx_empleados_departamento on empleados (departamento_id);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_departamentos_updated_at on departamentos;
create trigger trg_departamentos_updated_at
before update on departamentos
for each row execute function set_updated_at();

drop trigger if exists trg_usuarios_updated_at on usuarios;
create trigger trg_usuarios_updated_at
before update on usuarios
for each row execute function set_updated_at();

drop trigger if exists trg_empleados_updated_at on empleados;
create trigger trg_empleados_updated_at
before update on empleados
for each row execute function set_updated_at();

alter table departamentos enable row level security;
alter table usuarios enable row level security;
alter table empleados enable row level security;

-- El backend usa la service_role key (omite RLS).
-- No se crean políticas públicas: el acceso es solo por la API Node.js.
