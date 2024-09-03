import {
  Controller,
  // Get,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  ParseIntPipe,
  Patch,
  Req,
  ForbiddenException,
  Get,
  Query,
  Put,
  ParseArrayPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../Auth/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleGuard, Roles } from 'src/Auth/guards/role.guard';
import { Prisma, Role } from 'prisma/commerce/generated/vendoCommerce';
import { Permissions } from 'src/Auth/guards/permission.guard';
import { Permission } from 'src/Auth/permissions.enum';
import { UsersDto } from './dto/users.dto';
import { CreateUsersDto } from './dto/create-users.dto';
import { UpdateUsersDto } from './dto/update-users.dto';
import { ApiPagination, Pagination, PaginationOptions } from 'src/middlewares/pagination.middleware';
import * as bcrypt from 'bcrypt';
import { CaslAbilityGuard } from 'src/casl/casl-ability.guard';
import { CheckAbility } from 'src/casl/casl-ability.decorator';
import { DefaultArgs } from 'prisma/commerce/generated/vendoCommerce/runtime';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBody({ type: CreateUsersDto })
  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Post()
  async create(@Body() createUserDto: CreateUsersDto) {
    return this.usersService.create({
      data: createUserDto,
    });
  }

  @ApiBody({ type: UpdateUsersDto })
  @ApiResponse({ type: UsersDto })
  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Req() req, @Body() body: Prisma.usersUpdateArgs['data']) {
    if (
      body.u_status &&
      (req.user.role !== Role.Admin || req.user.role !== Role.Walmart_admin || req.user.role !== Role.Amazon_admin)
    ) {
      return new ForbiddenException("you don't have the permission to change the status");
    }

    if (body.u_password) {
      body.u_password = bcrypt.hashSync(body?.u_password?.toString(), 10);
    }

    if (req.user.id === id) {
      return this.usersService.update({
        data: { ...body, updated_at: new Date().getTime() },
        where: {
          id,
        },
        include: {
          manager_brands: true,
        },
      });
    } else if (
      req.user.role === Role.Admin ||
      req.user.role === Role.Walmart_admin ||
      req.user.role === Role.Amazon_admin
    ) {
      return this.usersService.update({
        data: { ...body, updated_at: new Date().getTime() },
        where: {
          id,
        },
        include: {
          manager_brands: true,
        },
      });
    }
    throw new ForbiddenException();
  }

  @ApiResponse({ isArray: true, type: UsersDto })
  @ApiQuery({
    name: 'name',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'status',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'email',
    type: String,
    required: false,
  })
  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @ApiPagination()
  @Get('/all')
  async findAll(
    @Req() req: any,
    @Pagination() pagination: PaginationOptions,
    @Query('name') name?: string,
    @Query('status') status?: string,
    @Query('email') email?: string,
    @Query('role') role?: string,
    @Query('account_type') account_type?: string,
  ) {
    const { page, limit, order, orderBy } = pagination;
    const OR: Prisma.Enumerable<Prisma.usersWhereInput> = [];
    const AND: Prisma.Enumerable<Prisma.usersWhereInput> = [];
    const where: Prisma.usersWhereInput = {};
    // if (req.user?.role === Role.Amazon_admin) {
    //   AND.push({ brands: { every: { brand: { brand_source: 'Amazon' } } } });
    // } else if (req.user?.role === Role.Walmart_admin) {
    //   AND.push({ brands: { every: { brand: { brand_source: 'Walmart' } } } });
    // }
    if (role) {
      AND.push({ role: { equals: Role[role] } });
    }
    if (name) {
      OR.push({ u_email: { contains: name } });
      OR.push({ u_name: { contains: name } });
    }
    if (status && !isNaN(parseInt(status))) {
      AND.push({ user_status: { equals: parseInt(status) } });
    }
    if (account_type) {
      AND.push({ account_type: { equals: account_type } });
    }
    if (OR.length > 0) {
      where.OR = OR;
    }
    if (AND.length > 0) {
      where.AND = AND;
    }
    const filter: Prisma.usersFindManyArgs<DefaultArgs> = {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [orderBy]: order,
      },
      where,
      // where: {
      //   OR,
      // },
    };

    const users = await this.usersService.findAll(filter);

    const count = await this.usersService.count({ where: filter.where });
    return {
      items: users,
      count,
      page,
      limit,
      order,
      orderBy,
    };
  }

  @ApiResponse({ type: UsersDto })
  @ApiBody({
    required: false,
    type: () => ({
      brand_ids: [Number],
    }),
  })
  @CheckAbility('admin')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Post('/:id/verify')
  async verifyByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.verify(id);
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/:id/brands')
  async getBrandsByUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne({
      where: { id },
      select: {
        brands: true,
      },
    });
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/brands')
  async getBrands(@Req() req) {
    if (req.user.role === 'Walmart-admin') {
      return this.usersService.getAllBrands('walmart');
    } else if (req.user.role === 'Amazon-admin') {
      return this.usersService.getAllBrands('amazon');
    }

    return this.usersService.findOne({
      where: { id: req.user.id },
      select: {
        brands: {
          select: {
            user: true,
            brand: true,
            role: true,
          },
        },
      },
    });
  }

  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/:id/permissions')
  async userPermissions(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne({
      where: { id },
      select: {
        permissions: {
          select: { id: true, name: true },
        },
      },
    });
  }
  @CheckAbility('read')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Get('/permissions')
  async Permissions() {
    return this.usersService.getAllPermissions();
  }

  @CheckAbility('delete')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Delete('/:id')
  async deleteUser(@Param('id', ParseIntPipe) userId: number, @Req() req: any) {
    return this.usersService.deleteUser({ userId, user: req.user });
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Put('/:id/account-manager')
  async assingAccountManager(
    @Param('id', ParseIntPipe) id: number,
    @Query('brandsId', new ParseArrayPipe({ items: Number, separator: ',', optional: false })) brandsId: number[],
  ) {
    return this.usersService.update({
      where: { id },
      data: {
        manager_brands: { connect: brandsId.map((brand) => ({ id: brand })) },
      },
    });
  }

  @CheckAbility('manage')
  @UseGuards(JwtAuthGuard, CaslAbilityGuard)
  @Delete('/:id/account-manager')
  async unassignAccountManager(
    @Param('id', ParseIntPipe) id: number,
    @Query('brandsId', new ParseArrayPipe({ items: Number, separator: ',', optional: false })) brandsId: number[],
  ) {
    return this.usersService.update({
      where: { id },
      data: {
        manager_brands: { disconnect: brandsId.map((brand) => ({ id: brand })) },
      },
    });
  }
}
