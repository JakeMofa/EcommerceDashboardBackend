import { Controller, Post, UseGuards, Request, Body, Get, Param, ParseIntPipe, Query, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RoleGuard, Roles } from './guards/role.guard';
import { Role, users } from '../../prisma/commerce/generated/vendoCommerce';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { LoginDto, SignupDto, ResetPasswordDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('local'))
  @Post('/login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Successfully logged in' })
  async login(@Body() body: LoginDto, @Request() req) {
    return this.authService.login(req.user);
  }

  @Post('/signup')
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  async signup(@Body() body: SignupDto) {
    return await this.authService.signup(body);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('/user-token/:id')
  @ApiOperation({ summary: 'Get user token by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User token retrieved successfully' })
  async userToken(@Param('id', ParseIntPipe) id: number) {
    return await this.authService.userToken(id);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin, Role.Manager, Role.User)
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('/me')
  @ApiOperation({ summary: 'Get current user details' })
  @ApiResponse({ status: 200, description: 'Current user details retrieved successfully' })
  async me(@Request() req): Promise<Omit<users, 'u_password'>> {
    const { u_password, ...user } = await this.usersService.findOne({
      where: { id: req.user.id },
      include: {
        permissions: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
    return user;
  }

  @Get('/reset-password')
  @ApiOperation({ summary: 'Send reset password email' })
  @ApiQuery({ name: 'email', type: String })
  @ApiResponse({ status: 200, description: 'Reset password email sent successfully' })
  async resetPasswordEmail(@Query('email') email: string) {
    return await this.authService.resetPasswordEmail(email);
  }

  @Patch('/reset-password')
  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await this.authService.resetPassword(body);
  }
}
