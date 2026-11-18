import { vi } from 'vitest';
import { describe, it, expect, beforeAll,beforeEach, afterEach, afterAll } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AuthProvider } from '../src/context/AuthContext';
import userEvent from '@testing-library/user-event';
import App from '../src/App.tsx'


const categoriasIniciales = [
  { id: 1, nombre: "Hardware" },
  { id: 2, nombre: "Software" },
];

let categoriasMock = [...categoriasIniciales];

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const fetchMock = vi.fn(
  async (input: string | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(String(input));
    const method = (init?.method ?? "GET").toUpperCase();
    console.log(`FETCH -> ${method} ${url.pathname}`, init?.body ?? "");

    if (method === "GET" && url.pathname === "/api/categorias/paginated") {
      const page = Number(url.searchParams.get("page") ?? 1);
      const perPage = Number(url.searchParams.get("cantPerPage") ?? 10);
      const start = (page - 1) * perPage;

      return jsonResponse({
        data: categoriasMock.slice(start, start + perPage),
        success: true,
        meta: {
          currentPage: page,
          itemsPerPage: perPage,
          totalItems: categoriasMock.length,
          totalPages: Math.ceil(categoriasMock.length / perPage),
        },
        message: "Categorías recuperadas",
      });
    }

    if (method === "POST" && url.pathname === "/api/categorias") {
      const body = JSON.parse(String(init?.body ?? "{}")) as { nombre?: string };
      const nueva = {
        id: Math.max(0, ...categoriasMock.map((categoria) => categoria.id)) + 1,
        nombre: body.nombre ?? "",
      };

      categoriasMock = [nueva, ...categoriasMock];
      return jsonResponse({ data: null, success: true, message: "Categoría creada" });
    }

    const match = url.pathname.match(/^\/api\/categorias\/(\d+)$/);

    if(method==="DELETE")console.log(`Request received: ${method} ${url.pathname}`);
    if (match && method === "PUT") {
      const id = Number(match[1]);
      const body = JSON.parse(String(init?.body ?? "{}")) as { nombre?: string };
      const categoria = categoriasMock.find((item) => item.id === id);

      if (!categoria) {
        return jsonResponse({ data: null, success: false, message: "Categoría no encontrada" }, 404);
      }

      categoria.nombre = body.nombre ?? categoria.nombre;
      return jsonResponse({ data: null, success: true, message: "Categoría modificada" });
    }

    if (match && method === "DELETE") {
      const id = Number(match[1]);
      const index = categoriasMock.findIndex((item) => item.id === id);

      if (index === -1) {
        return jsonResponse({ data: null, success: false, message: "Categoría no encontrada" }, 404);
      }

      categoriasMock.splice(index, 1);
      return jsonResponse({ data: null, success: true, message: "Categoría eliminada" });
    }

    return jsonResponse(
      { data: null, success: false, message: `Request sin mock: ${method} ${url.pathname}` },
      501,
    );
  },
);

vi.stubGlobal("fetch", fetchMock);

beforeEach(() => {
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  categoriasMock = categoriasIniciales.map((c) => ({ ...c }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  sessionStorage.clear();
  document.cookie = 'AccessToken=; Max-Age=0; path=/';
});

describe("Test de integración de categorías", () => {
  const loginAsAdmin = async () => {
    sessionStorage.setItem('usuario', JSON.stringify({ type: 'admin',dni:"47107024",nombre: "Admin" }));
    document.cookie = 'AccessToken=mocked-access-token; path=/';
  };


  it("debería listar las categorías correctamente", async () => {
    await loginAsAdmin();
    render(
      <MemoryRouter initialEntries={['/categorias/crud']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(await screen.findByText("Hardware")).toBeInTheDocument();
    expect(await screen.findByText("Software")).toBeInTheDocument();
  });

  it("debería crear una nueva categoría correctamente", async () => {
    await loginAsAdmin();

    render(
      <MemoryRouter initialEntries={['/categorias/crud']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
    const inputtxt = await screen.findByTestId("inputNombre");
    await userEvent.type(inputtxt, "Periféricos");
    const submitButton = await screen.findByTestId("guardarCategoria");
    await userEvent.click(submitButton);

    expect(await screen.findByText("Categoría creada")).toBeInTheDocument();

    expect(await screen.findByText("Periféricos")).toBeInTheDocument();
  });

  it("debería actualizar una categoría correctamente", async () => {
    await loginAsAdmin();

    render(
      <MemoryRouter initialEntries={['/categorias/crud']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    const editarButton = await screen.findByTestId("editarCategoria1");
    await userEvent.click(editarButton);
    const inputtxt = await screen.findByTestId("inputNombre");
    await userEvent.clear(inputtxt);
    await userEvent.type(inputtxt, "Hardware Actualizado");
    const submitButton = await screen.findByTestId("guardarCategoria");
    await userEvent.click(submitButton);

    expect(await screen.findByText("Categoría modificada")).toBeInTheDocument();

    expect(await screen.findByText("Hardware Actualizado")).toBeInTheDocument();
  });

  it("debería eliminar una categoría correctamente", async () => {
    await loginAsAdmin();

    render(
      <MemoryRouter initialEntries={['/categorias/crud']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    const eliminarButton = await screen.findByTestId("eliminarCategoria1");
    await userEvent.click(eliminarButton);

    const confirmButton = screen.queryByText("Confirmar");

    if (confirmButton) {
      await userEvent.click(confirmButton);
    }

    expect(await screen.findByText("Categoría eliminada")).toBeInTheDocument();

    expect(screen.queryByText("Hardware")).not.toBeInTheDocument();
  });
});