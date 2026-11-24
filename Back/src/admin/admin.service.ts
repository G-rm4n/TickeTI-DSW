import { error } from "node:console";
import { adminDAO } from "./admin.DAO.js";
import { type createAdminInDto } from "./DTO/CreateAdmin.dto.js";
import { NotFoundError } from "../utils/base.error.js";
import type { ModifyAdminBodyDTO } from "./DTO/ModifyAdmin.dto.js";
import { hashPassword } from "../utils/password.js";

export class adminService {
  static async createAdmin(adminInput: createAdminInDto) {
    const adminHash = { ...adminInput, pass: await hashPassword(adminInput.pass)};
    return await adminDAO.createAdmin(adminHash);
  }

  static async getAllAdmins() {
    return await adminDAO.findAll({});
  }

  static async updateAdmin(adminInput: ModifyAdminBodyDTO & { pass?: string }, dni: string) {
    const adminfound = await adminDAO.findOne({ dni: dni });
    if (!adminfound) throw new NotFoundError("Administrador no encontrado", "El administrador con el dni ${dni} no fue encontrado");
    const dataToUpdate = adminInput.pass ? { ...adminInput, pass: await hashPassword(adminInput.pass) } : adminInput;
    return await adminDAO.updateAdmin(dataToUpdate, adminfound);
  }

  
  static async deleteAdmin(dni: string): Promise<void> {
    const adminfound = await adminDAO.findOne({ dni: dni });
      if (!adminfound) throw new NotFoundError("Administrador no encontrado", `El administrador con el dni ${dni} no fue encontrado`);
    await adminDAO.deleteAdmin(adminfound);
  }
}