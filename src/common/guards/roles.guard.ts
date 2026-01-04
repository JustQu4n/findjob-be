import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('[RolesGuard] Required roles:', requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    console.log('[RolesGuard] User email:', user?.email);
    console.log('[RolesGuard] User roles:', user?.roles?.map(r => r.role_name));
    
    if (!user || !user.roles) {
      console.log('[RolesGuard] ❌ No user or no roles');
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }

    const hasRole = requiredRoles.some((role) =>
      user.roles.some((userRole) => userRole.role_name === role),
    );

    console.log('[RolesGuard] Has required role:', hasRole);

    if (!hasRole) {
      console.log('[RolesGuard] ❌ User does not have required role');
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }

    console.log('[RolesGuard] ✅ Access granted');
    return true;
  }
}
