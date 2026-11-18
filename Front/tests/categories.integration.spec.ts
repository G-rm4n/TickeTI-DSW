import { http, HttpResponse, RequestQuery } from 'msw/http'
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node'
import type { IPaginatedApiResponse } from '../src/responses/IPaginatedApiResponse.ts'
import type { CategoriaModel } from '../src/models/categoria.model.ts'
import { IApiResponse } from '../src/responses/IApiResponse.ts'
import { ICreateCategoriaRequest } from '../src/requests/ICreateCategoriaRequest.ts'
import { IModifyCategoriaRequest } from '../src/requests/IModifyCategoriaRequest.ts'

let categoriasMock: CategoriaModel[] = [
  { id: 1, nombre: "Hardware" },
  { id: 2, nombre: "Software" }
]

const server = setupServer(
  http.get("*/categorias/paginated", async ({ request }) => {
    const url = new URL(request.url);

    const cantPerPage = url.searchParams.get("cantPerPage");
    const page = url.searchParams.get("page");

    const categorias = categoriasMock.slice(Number(cantPerPage) * (Number(page) - 1), Number(page) * Number(cantPerPage))
    const response: IPaginatedApiResponse<CategoriaModel> = {
      data: categorias,
      success: true,
      meta: {
        currentPage: Number(page!),
        itemsPerPage: Number(cantPerPage!),
        totalItems: categoriasMock.length,
        totalPages: Math.ceil(categoriasMock.length / Number(cantPerPage))
      },
      message: "Categorias recuperadas con exito"
    }

    return HttpResponse.json(response, { status: 200 })
  }),

  http.delete("*/categorias/:id", async ({ params }) => {
    const id = Number(params.id);
    const index = categoriasMock.findIndex(c => c.id == id);
    if (index !== -1) {
      categoriasMock.splice(index, 1)

      const response: IApiResponse<null> = {
        data: null,
        success: true,
        message: "Categoria eliminada exitosamente"
      }

      return HttpResponse.json(response, { status: 200 });
    }

    const response: IApiResponse<null> = {
      data: null,
      success: false,
      message: "Categoria no encontrada"
    }

    return HttpResponse.json(response, { status: 404 });
  }),

  http.post("*/categorias", async ({ request }) => {
    const body: ICreateCategoriaRequest = (await request.json()) as any;

    if (body.nombre == null || body.nombre == "") {
      const response: IApiResponse<null> = {
        data: null,
        message: "Error de validacion",
        errors: [{
          field: "nombre",
          error: "Se esperaba string, se recibio indefinido"
        }],
        success: false
      }

      return HttpResponse.json(response, { status: 400 });
    }
    const newCat: CategoriaModel = {
      id: categoriasMock.reduce((max, item) => Math.max(max, item.id) + 1, -Infinity),
      nombre: body.nombre
    };

    categoriasMock = [newCat, ...categoriasMock];

    const response: IApiResponse<null> = {
      data: null,
      success: true,
      message: "Categoria creada con exito"
    }

    return HttpResponse.json(response, { status: 200 });
  }),

  http.put("*/categorias/:id", async ({ params, request }) => {
    const body: IModifyCategoriaRequest = await request.json() as any;
    const id = Number(params.id);
    const index = categoriasMock.findIndex(c => c.id == id);

    if (index === -1) {
      const response: IApiResponse<null> = {
        data: null,
        success: false,
        message: "Categoria no encontrada"
      }

      return HttpResponse.json(response, { status: 404 });
    }

    if (body.nombre == null || body.nombre == "") {
      const response: IApiResponse<null> = {
        data: null,
        message: "Error de validacion",
        errors: [{
          field: "nombre",
          error: "Se esperaba string, se recibio indefinido"
        }],
        success: false
      }

      return HttpResponse.json(response, { status: 400 });
    }

    categoriasMock[index].nombre = body.nombre

    const response: IApiResponse<null> = {
      data: null,
      success: true,
      message: "Categoria modificada con exito"
    }

    return HttpResponse.json(response, { status: 200 });
  })
)

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
  categoriasMock = [
    { id: 1, nombre: "Hardware" },
    { id: 2, nombre: "Software" }
  ]
});
afterAll(() => server.close());

describe("Test de integracion:crud categoria", () => {
  const logAsAdmin = () => {
    sessionStorage.setItem('usuario', JSON.stringify({ dni: 47107024, type: "admin", name: "admin" }));
    cookieStore.set("AccessToken", 'tokenFalso')
  }
})