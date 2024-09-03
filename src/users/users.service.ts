import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { VendoCommerceDBService } from '../prisma.service';
import { Brand_status, Prisma } from 'prisma/commerce/generated/vendoCommerce';
@Injectable()
export class UsersService {
  constructor(private commerceDB: VendoCommerceDBService) {}
  async getAllBrands(source?: string) {
    return this.commerceDB.brands.findMany({
      where: {
        AND: [{ status: { not: Brand_status.Deleted } }, source ? { brand_source: { equals: source } } : {}],
      },
    });
  }
  async create({ data }: Prisma.usersCreateArgs) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const list = await this.commerceDB.users.findMany({
      where: {
        u_email: data.u_email,
      },
    });
    if (list.length > 0) {
      throw new BadRequestException('email already exists');
    }
    const { u_password, ...user } = await this.commerceDB.users.create({
      data: {
        u_email: data.u_email,
        user_status: 0,
        u_type: 0,
        u_name: data.u_name,
        role: data.role,
        u_password: bcrypt.hashSync(data.u_password, 10),
        created_at: new Date().getTime(),
        updated_at: new Date().getTime(),
      },
      include: {
        permissions: {
          select: {
            name: true,
          },
        },
      },
    });
    return user;
  }

  findAll(param: Prisma.usersFindManyArgs) {
    return this.commerceDB.users.findMany(param);
  }

  count(filter) {
    return this.commerceDB.users.count(filter);
  }

  async findOne(param: Prisma.usersFindFirstOrThrowArgs) {
    const user = await this.commerceDB.users.findFirst(param);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  update(args: Prisma.usersUpdateArgs) {
    return this.commerceDB.users.update(args);
  }

  deleteUser({ userId, user }) {
    if (user.role === 'Admin') {
      return this.commerceDB.users.delete({ where: { id: userId } });
    } else if (user.id == userId) {
      return this.commerceDB.users.delete({ where: { id: userId } });
    } else {
      throw new ForbiddenException('You are not allowed to delete this user');
    }
  }

  async verify(userId: number) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { u_password, ...user } = await this.commerceDB.users.update({
      where: { id: userId },
      data: {
        user_status: 1,
      },
    });
    return user;
  }

  async getAllPermissions() {
    return this.commerceDB.permissions.findMany();
  }
}
