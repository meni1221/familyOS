import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamiliesController } from './families.controller';
import { FamiliesService } from './families.service';
import { Family, FamilySchema } from '../../database/models/family.model';
import {
  FamilyMembership,
  FamilyMembershipSchema,
} from '../../database/models/family-membership.model';
import {
  FamilyInvitation,
  FamilyInvitationSchema,
} from '../../database/models/family-invitation.model';
import { User, UserSchema } from '../../database/models/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Family.name, schema: FamilySchema },
      { name: FamilyMembership.name, schema: FamilyMembershipSchema },
      { name: FamilyInvitation.name, schema: FamilyInvitationSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [FamiliesController],
  providers: [FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
