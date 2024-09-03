import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants/auth.constant';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../users/users.service';
import { RoleGuard } from './guards/role.guard';
import { PermissionsGuard } from './guards/permission.guard';
import { BrandsService } from 'src/brands/brands.service';
import { DatabaseBrandModule, DatabaseCommerceModule, DatabaseService } from 'src/brands/database.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { BrandsModule } from 'src/brands/brands.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseCommerceModule,
    DatabaseBrandModule,
    BrandsModule,
    HttpModule,
    UsersModule,
    PassportModule,
    MailModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '18000s' },
    }),
  ],

  providers: [
    UsersService,
    DatabaseService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: 'ROLE_GUARD',
      useClass: RoleGuard,
    },
    {
      provide: 'PERMISSION_GUARD',
      useClass: PermissionsGuard,
    },
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
