import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { users } from 'prisma/commerce/generated/vendoCommerce';
import { UsersService } from 'src/users/users.service';
import { compareMD5Hash, isMd5 } from 'src/utils/md5.util';
import { MailService } from '../mail/mail.service';
import * as Crypto from 'crypto';
import { ResetPasswordDto, SignupDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtTokenService: JwtService,
    private mailService: MailService,
  ) {}
  private logger = new Logger('auth');

  async validateUserCredentials(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne({
      where: { u_email: email },
      include: { permissions: { select: { name: true } } },
    });
    if (isMd5(user.u_password) && compareMD5Hash(password, user.u_password)) {
      const { u_password, ...result } = user;
      return user;
    }
    if (user && (await bcrypt.compare(password, user.u_password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { u_password, ...result } = user;
      return user;
    }
    return null;
  }

  async login(user: users) {
    const payload = {
      email: user.u_email,
      id: user.id,
      role: user.role,
    };
    const { u_password, ...res } = user;
    return {
      ...res,
      access_token: this.jwtTokenService.sign(payload),
    };
  }
  async signup(data: SignupDto) {
    const user = await this.usersService.create({
      data: {
        ...data,
        u_type: 0,
        user_status: 0,
      },
    });
    return {
      ...user,
      ...this.token(user),
    };
  }
  token(user: Omit<users, 'u_password'>) {
    const payload = {
      email: user.u_email,
      id: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtTokenService.sign(payload),
    };
  }
  async userToken(id: number) {
    const { u_password, ...user } = await this.usersService.findOne({
      where: { id },
    });
    const payload = {
      email: user.u_email,
      id: user.id,
      role: user.role,
    };
    return {
      ...user,
      access_token: this.jwtTokenService.sign(payload),
    };
  }

  async resetPasswordEmail(email: string) {
    const user = await this.usersService.findOne({
      where: { u_email: email },
    });

    const resetToken = Crypto.randomBytes(20).toString('hex');

    await this.usersService.update({
      where: { id: user.id },
      data: { password_reset_token: resetToken },
    });

    await this.mailService.sendResetPassword(user, resetToken);

    return { success: true };
  }

  async resetPassword(user: ResetPasswordDto) {
    if (!user.token) {
      return { success: false };
    }

    const usertoUpdate = await this.usersService.findOne({
      where: { password_reset_token: user.token },
    });

    await this.usersService.update({
      where: { id: usertoUpdate.id },
      data: {
        u_password: bcrypt.hashSync(user.u_password, 10),
        updated_at: new Date().getTime(),
        password_reset_token: null,
      },
    });

    return { success: true };
  }
}
