import { SetMetadata } from '@nestjs/common';

// unique key the Reflector uses to look up the metadata
export const ROLES_KEY = 'roles';

// Roles method for controller
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
