import { test, expect } from '@playwright/test';

test('navega desde la página de inicio hacia el formulario de login', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('TickeTI Support', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
});
