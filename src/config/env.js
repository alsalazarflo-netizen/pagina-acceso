import dotenv from "dotenv";

dotenv.config();

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Revísala en el archivo .env (Project Settings > API en Supabase).`
    );
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  jwtSecret: required("JWT_SECRET"),
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
};
