import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

@Injectable()
// Extends the standard Passport JWT Guard to customize failure responses
export class AuthGuard extends PassportAuthGuard('jwt') {
  // Intercepts the authentication outcome before it reaches the controller
  override handleRequest(err: any, user: any, info: any) {
    // Check if the token validation failed or if the user does not exist
    if (err || !user) {
      // Case 1: The token is structurally valid but its expiration time has passed
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Token has expired — please log in again',
        );
      }
      // Case 2: The token is malformed, edited, or signed with an incorrect secret key
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token — please log in again');
      }
      throw new UnauthorizedException('Authentication required');
    }

    // Success: Returns the decoded payload and automatically attaches it to req.user
    return user;
  }
}
