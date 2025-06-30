import { User } from '@fusionauth/typescript-client';
import { Request } from 'express';
import { Profile } from '../prisma/client';

export type AuthenticatedRequest = Request & { user: User };

export type AppUser = {
  login: string;

  profile: Profile;
};
