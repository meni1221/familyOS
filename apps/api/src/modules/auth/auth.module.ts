import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetService } from './password-reset.service';
import { MailModule } from '../../mail/mail.module';
import { User, UserSchema } from '../../database/models/user.model';
import { Family, FamilySchema } from '../../database/models/family.model';
import {
  FamilyMembership,
  FamilyMembershipSchema,
} from '../../database/models/family-membership.model';
import { Session, SessionSchema } from '../../database/models/session.model';
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from '../../database/models/password-reset-token.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Family.name, schema: FamilySchema },
      { name: FamilyMembership.name, schema: FamilyMembershipSchema },
      { name: Session.name, schema: SessionSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
    ]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordResetService],
  exports: [AuthService],
})
export class AuthModule {}
