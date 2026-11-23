import { test, expect } from '@playwright/test';

const USER_CREDENTIALS = {
  email: 'crodri01@ticketi.com',
  pass: 'pass',
};

const TECNICO_CREDENTIALS = {
  email: 'mgomez01@ticketi.com',
  pass: 'PassTecnico',
};

const uniqueSuffix = Date.now();
const ticketTitle = `Falla de red en puesto E2E #${uniqueSuffix}`;
const ticketDescription = `El equipo no obtiene dirección IP por DHCP (prueba E2E ${uniqueSuffix}).`;

test.describe.serial('Flujo Principal de Negocio - Gestión de Tickets', () => {
  test('crea un nuevo ticket desde el rol usuario y verifica que aparezca en el listado', async ({ page }) => {
    // 1. Iniciar sesión como usuario solicitante
    await page.goto('/login');
    await page.getByLabel('E-mail').fill(USER_CREDENTIALS.email);
    await page.getByLabel('Contraseña').fill(USER_CREDENTIALS.pass);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/Mis-tickets$/);
    await expect(page.getByRole('heading', { name: 'Mis tickets' })).toBeVisible();

    // 2. Abrir el formulario de creación de ticket
    await page.getByRole('button', { name: '+ Reportar nuevo ticket' }).click();
    await expect(page.getByRole('heading', { name: 'Generar Solicitud de Incidencia' })).toBeVisible();

    // 3. Completar los campos del formulario usando locators resilientes
    await page
      .getByPlaceholder('Ej: Falla en switch de planta o reinstalación de SO')
      .fill(ticketTitle);

    await page.getByLabel('Categoría del Incidente').selectOption({ label: 'Redes' });
    await page.getByLabel('Prioridad del Incidente').selectOption({ label: 'Alta' });

    await page
      .getByPlaceholder('Describí los detalles del problema...')
      .fill(ticketDescription);

    // 4. Enviar el formulario
    await page.getByRole('button', { name: 'Crear Ticket' }).click();

    // 5. Verificar que el formulario se cierra y el nuevo ticket aparece en el listado
    await expect(page.getByRole('heading', { name: 'Generar Solicitud de Incidencia' })).toBeHidden();
    await expect(page.getByRole('heading', { name: ticketTitle })).toBeVisible();
    await expect(page.getByText(ticketDescription)).toBeVisible();
  });

  test('permite al técnico visualizar tickets en el Panel Técnico y tomar el ticket creado', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('E-mail').fill(TECNICO_CREDENTIALS.email);
    await page.getByLabel('Contraseña').fill(TECNICO_CREDENTIALS.pass);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

    await expect(page).toHaveURL(/\/tecnico$/);
    await expect(page.getByRole('heading', { name: 'Panel Técnico' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Refrescar' })).toBeVisible();

    // Localizar la tarjeta del ticket creado en el paso anterior y tomarlo
    const ticketHeading = page.getByRole('heading', { name: ticketTitle });
    await expect(ticketHeading).toBeVisible();

    const ticketCard = ticketHeading.locator('../../..');

    const tomarButton = ticketCard.getByRole('button', { name: 'Tomar Ticket' });
    await expect(tomarButton).toBeVisible();
    await tomarButton.click();

    // Al tomarlo, el botón "Tomar Ticket" de esa tarjeta desaparece y pasa a "En Proceso"
    await expect(tomarButton).toBeHidden();
    await expect(ticketCard.getByText('En Proceso')).toBeVisible();

    // Navegar a "Mis asignaciones" y verificar que el ticket tomado figura asignado al técnico
    await page.getByRole('link', { name: 'Mis asignaciones' }).first().click();
    await expect(page).toHaveURL(/\/mis-asignaciones$/);
    await expect(page.getByRole('heading', { name: 'Mis asignaciones pendientes' })).toBeVisible();
    await expect(page.getByRole('heading', { name: ticketTitle })).toBeVisible();
  });
});
