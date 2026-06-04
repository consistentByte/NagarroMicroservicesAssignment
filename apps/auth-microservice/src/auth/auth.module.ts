import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import fs from 'fs';
import path from 'path';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        
        // In docker There is /app/apps/auth-microservice/...

        //For local
        // const privateKey = fs.readFileSync(
        //   path.join(process.cwd(), 'apps/auth-microservice/keys/private.pem'),
        // );

        // const publicKey = fs.readFileSync(
        //   path.join(process.cwd(), 'apps/auth-microservice/keys/public.pem'),
        // );
        

        // For docker
        const privateKey = fs.readFileSync(
          path.join(process.cwd(), 'keys', 'private.pem'),
        );

        const publicKey = fs.readFileSync(
          path.join(process.cwd(), 'keys', 'public.pem'),
        );
        
        return {
          // If private key exists (Auth Microservice), provide both for signing.
          // Otherwise (Other Microservices), only provide public key for verifying.
          privateKey: privateKey || undefined,
          publicKey: publicKey,
          signOptions: {
            algorithm: 'RS256',
            expiresIn: '1h',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  exports: [],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}

/*
secret: 'abc123',
signOptions: {
  expiresIn: '1h',
},
*/
