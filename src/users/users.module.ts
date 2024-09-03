import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { VendoBrandDBService, VendoCommerceDBService, VendoDBService } from '../prisma.service';
import { RoleGuard } from 'src/Auth/guards/role.guard';
import { PermissionsGuard } from 'src/Auth/guards/permission.guard';
import { BrandsModule } from 'src/brands/brands.module';
import { CaslModule } from 'src/casl/casl.module';

@Module({
  imports: [CaslModule, BrandsModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    VendoDBService,
    VendoBrandDBService,
    VendoCommerceDBService,
    {
      provide: 'ROLE_GUARD',
      useClass: RoleGuard,
    },
    {
      provide: 'PERMISSION_GUARD',
      useClass: PermissionsGuard,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
