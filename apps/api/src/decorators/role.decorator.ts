import { SetMetadata } from '@nestjs/common';
import { Role } from './enum/role.enum'; // Assicurati di avere un enum dei ruoli

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
