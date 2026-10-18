import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Family, FamilyDocument } from '../../database/models/family.model';
import { FamilyMembership, FamilyMembershipDocument } from '../../database/models/family-membership.model';
import { User, UserDocument } from '../../database/models/user.model';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectModel(Family.name) private familyModel: Model<FamilyDocument>,
    @InjectModel(FamilyMembership.name) private membershipModel: Model<FamilyMembershipDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getUserFamilies(userId: string) {
    const memberships = await this.membershipModel.find({ userId }).exec();
    const families = await this.familyModel.find({
      _id: { $in: memberships.map((m) => m.familyId) },
    }).exec();

    return {
      data: families.map((family) => {
        const membership = memberships.find((m) => m.familyId.toString() === family._id.toString());
        return {
          ...family.toObject(),
          role: membership?.role ?? 'MEMBER',
        };
      }),
    };
  }

  async createFamily(userId: string, name: string) {
    const session = await this.familyModel.db.startSession();
    session.startTransaction();

    try {
      const family = await this.familyModel.create([{ name }], { session });

      await this.membershipModel.create([
        {
          familyId: family[0]._id,
          userId,
          role: 'OWNER',
        },
      ], { session });

      await this.userModel.updateOne(
        { _id: userId },
        { $addToSet: { families: family[0]._id } },
        { session },
      );

      await session.commitTransaction();
      return { data: family[0] };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getFamilyById(familyId: string) {
    const family = await this.familyModel.findById(familyId).exec();
    if (!family) {
      throw new NotFoundException('משפחה לא נמצאה');
    }
    return family;
  }
}
