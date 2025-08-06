import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto, SignupDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, role } = signupDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user with onboarding progress
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role.toUpperCase() as any,
        onboardingProgress: {
          create: {
            currentStep: 1,
            completedSteps: [],
            isCompleted: false,
            data: {},
          },
        },
      },
      include: {
        profile: true,
        onboardingProgress: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Always redirect to onboarding for new users
    const redirectTo = `/onboarding/${role.toLowerCase()}`;

    return {
      user: this.excludePassword(user),
      ...tokens,
      redirectTo,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password, role } = loginDto;
    // Note: role parameter is optional and for frontend UX only
    // We always use the role stored in the database for security

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        onboardingProgress: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Determine redirect based on onboarding status
    let redirectTo = `/dashboard/${user.role.toLowerCase()}`;
    
    if (!user.onboardingProgress || !user.onboardingProgress.isCompleted) {
      redirectTo = `/onboarding/${user.role.toLowerCase()}`;
    }

    return {
      user: this.excludePassword(user),
      ...tokens,
      redirectTo,
    };
  }

  async googleLogin(user: any) {
    // Handle Google OAuth login
    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
      include: {
        profile: true,
        onboardingProgress: true,
      },
    });

    let dbUser;
    
    if (existingUser) {
      dbUser = existingUser;
    } else {
      // Create new user from Google data
      dbUser = await this.prisma.user.create({
        data: {
          email: user.email,
          role: 'INFLUENCER', // Default to influencer for Google login
          emailVerified: true,
          profile: {
            create: {
              firstName: user.firstName,
              lastName: user.lastName,
              avatarUrl: user.picture,
            },
          },
        },
        include: {
          profile: true,
          onboardingProgress: true,
        },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(dbUser.id, dbUser.email, dbUser.role);

    // Determine redirect
    let redirectTo = `/dashboard/${dbUser.role.toLowerCase()}`;
    
    if (dbUser.onboardingProgress && !dbUser.onboardingProgress.isCompleted) {
      redirectTo = `/onboarding/${dbUser.role.toLowerCase()}`;
    }

    return {
      user: this.excludePassword(dbUser),
      ...tokens,
      redirectTo,
    };
  }

  async refreshToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private excludePassword(user: any) {
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.excludePassword(user);
  }
}
