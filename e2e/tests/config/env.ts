import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Copia .env.example a .env y complétala.`);
  }
  return value;
}

export const env = {
  baseUrl: process.env.BASE_URL ?? 'http://localhost:5173',
  apiUrl: process.env.API_URL ?? 'http://localhost:8080/api/v1',
  headless: process.env.HEADLESS?.toLowerCase() !== 'false',
  get adminEmail() {
    return required('ADMIN_EMAIL');
  },
  get adminPassword() {
    return required('ADMIN_PASSWORD');
  },
  // Sesión de UI reutilizable generada por el proyecto `setup` (ignorada por git).
  authFile: path.resolve(__dirname, '..', '..', 'playwright', '.auth', 'user.json'),
};
