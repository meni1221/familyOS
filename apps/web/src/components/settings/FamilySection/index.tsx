import { IconUsers } from '@tabler/icons-react';
import SectionCard from '../SectionCard';
import {
  useCurrentFamily,
  useFamilyInvitations,
  useFamilyMembers,
} from '../../../hooks/useFamily';
import FamilySummary from './FamilySummary';
import MemberList from './MemberList';
import InviteForm from './InviteForm';
import InvitationList from './InvitationList';

/** The family card: who is in it, and who was invited. */
const FamilySection = () => {
  const { data: family, isLoading: familyLoading } = useCurrentFamily();
  const { data: members } = useFamilyMembers();
  const { data: invitations } = useFamilyInvitations();

  const canInvite = members?.find((member) => member.isYou)?.role === 'OWNER';

  return (
    <SectionCard title="המשפחה" description="חברים והזמנות להצטרפות" icon={IconUsers}>
      <div className="space-y-5">
        <FamilySummary family={family} isLoading={familyLoading} />

        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink">חברי המשפחה</h3>
          <MemberList members={members ?? []} />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-ink">הזמנות</h3>
          <InviteForm canInvite={canInvite} />
          <InvitationList invitations={invitations ?? []} canInvite={canInvite} />
        </div>
      </div>
    </SectionCard>
  );
};

export default FamilySection;
