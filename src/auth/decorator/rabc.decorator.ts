import { Reflector } from '@nestjs/core';
import { Role } from 'src/users/entities/user.entity';

export const CustomRBAC = Reflector.createDecorator<Role>();
