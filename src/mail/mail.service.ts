import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendResetPassword(user: any, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user?.u_email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Reset Password',
      template: './resetPassword',
      context: {
        name: user.u_name,
        url,
      },
    });
  }
}
