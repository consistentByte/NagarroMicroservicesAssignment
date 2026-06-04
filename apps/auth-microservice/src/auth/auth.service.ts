import { Injectable } from '@nestjs/common';
import { AuthPayloadDto } from './dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser({ employeeId, password }: AuthPayloadDto) {
    // checks in DB if the username and pass is valid.
    console.log(employeeId, password);
    const user = await this.prisma.employee.findFirst({
      where: { employeeId: employeeId },
    });

    if (!user) {
      return null; // user not found
    }
    console.log(user);

    if (password === user.password) {
      const { password, ...user_ } = user; // to remove the password from user object.
      return this.jwtService.sign(user_);
    }
  }
}
