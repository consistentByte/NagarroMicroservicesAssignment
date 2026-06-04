import { Injectable } from '@nestjs/common';
import { AuthPayloadDto } from './dtos/auth.dto';
import { JwtService } from '@nestjs/jwt';

const fakeUsers = [
  { id: 1, username: 'saurabh', password: 'guest' },
  { id: 2, username: 'Harsh', password: 'guest' },
];

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // validateUser({ username, password }: AuthPayloadDto) {
  //   // checks in DB if the username and pass is valid.
  //   const findUser = fakeUsers.find((user) => user.username === username);
  //   if (!findUser) {
  //       return null; // user not found
  //   }

  //   if (password === findUser.password) {
  //     const { password, ...user } = findUser; // to remove the password from user object.
  //     return this.jwtService.sign(user);
  //   }
  // }
}
