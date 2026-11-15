import { test, expect } from '@playwright/test';

/**
 * Credenciales generadas por los seeders del Backend + el hook beforeCreate de PersonSchema
 * (sin tildes para cumplir con la validación RFC de <input type="email"> y zod.email()):
 * - UsuarioSeeder (Carlos Rodríguez, Empresa 1): mail "crodri01@ticketi.com", pass "pass"
 * - TecnicoSeeder (Martín Gómez, Empresa 1): mail "mgomez01@ticketi.com", pass "PassTecnico"
 * - AdministradorSeeder (Umbrella1 Kicket, Empresa 1): mail "ukicke01@ticketi.com", pass "KicketUmbrella"
 */
const USER_CREDENTIALS = {
  email: 'crodri01@ticketi.com',
  pass: 'pass',
};

const TECNICO_CREDENTIALS = {
  email: 'mgomez01@ticketi.com',
  pass: 'PassTecnico',
};

test.describe('Autenticación y Control de Acceso', () => {
  test('bloquea el acceso a rutas protegidas sin sesión y redirige a /login', async ({ page }) => {
    await page.goto('/Mis-tickets');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();

    await page.goto('/tecnico');
    await expect(page).toHaveURL(/\/login$/);

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('permite iniciar sesión con un usuario válido y redirige a /Mis-tickets', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();

    await page.getByLabel('E-mail').fill(USER_CREDENTIALS.email);
    await page.getByLabel('Contraseña').fill(USER_CREDENTIALS.pass);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/Mis-tickets$/);
    await expect(page.getByRole('heading', { name: 'Mis tickets' })).toBeVisible();
    await expect(
      page.getByText('Reportá nuevas incidencias y hacé el seguimiento de tus solicitudes')
    ).toBeVisible();
    await expect(page.getByRole('button', { name: '+ Reportar nuevo ticket' })).toBeVisible();
  });

  test('permite iniciar sesión con un técnico válido y redirige a /tecnico', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('E-mail').fill(TECNICO_CREDENTIALS.email);
    await page.getByLabel('Contraseña').fill(TECNICO_CREDENTIALS.pass);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/tecnico$/);
    await expect(page.getByRole('heading', { name: 'Panel Técnico' })).toBeVisible();
    await expect(page.getByText('Gestioná las solicitudes de soporte')).toBeVisible();
  });

  test('impide que un usuario con rol "user" acceda a rutas exclusivas de técnico o admin', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('E-mail').fill(USER_CREDENTIALS.email);
    await page.getByLabel('Contraseña').fill(USER_CREDENTIALS.pass);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await expect(page).toHaveURL(/\/Mis-tickets$/);

    await page.goto('/tecnico');
    await expect(page).toHaveURL(/\/Mis-tickets$/);
  });
});

