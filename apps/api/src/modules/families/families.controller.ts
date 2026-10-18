import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { AuthenticatedRequest } from '../../middleware/authenticated-request';
import { CreateFamilyDto, CreateInvitationDto, AcceptInvitationDto } from './dto';

@ApiTags('families')
@Controller('api/v1/families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user families' })
  async getFamilies(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.familiesService.getUserFamilies(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new family' })
  @ApiBody({ type: CreateFamilyDto })
  async createFamily(@Body() body: CreateFamilyDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.familiesService.createFamily(user.id, body.name);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get the current family' })
  async getCurrentFamily(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.familiesService.getCurrentFamily(user.familyId);
  }

  @Get('members')
  @ApiOperation({ summary: 'List the members of the current family' })
  async getMembers(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.familiesService.getMembers(user.familyId, user.id);
  }

  @Get('invitations')
  @ApiOperation({ summary: 'List invitations for the current family' })
  async getInvitations(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.familiesService.getInvitations(user.familyId);
  }

  @Post('invitations')
  @ApiOperation({ summary: 'Invite someone to the current family' })
  @ApiBody({ type: CreateInvitationDto })
  async createInvitation(@Body() body: CreateInvitationDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.familiesService.createInvitation(user.familyId, user.id, body);
  }

  @Delete('invitations/:id')
  @ApiOperation({ summary: 'Revoke a pending invitation' })
  @ApiParam({ name: 'id', type: String })
  async revokeInvitation(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    return this.familiesService.revokeInvitation(user.familyId, user.id, id);
  }

  @Post('invitations/accept')
  @ApiOperation({ summary: 'Accept a family invitation' })
  @ApiBody({ type: AcceptInvitationDto })
  async acceptInvitation(@Body() body: AcceptInvitationDto, @Req() req: AuthenticatedRequest) {
    const user = req.user;
    if (!user) throw new UnauthorizedException('נדרשת התחברות');
    const sessionToken = req.cookies?.session;
    return this.familiesService.acceptInvitation(user.id, body.token, sessionToken);
  }
}
