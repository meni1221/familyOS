import type { BabyProfile } from '../../../lib/types';
import { babyColorTokens } from '../../../lib/babyColors';

interface BabySwitcherProps {
  profiles: BabyProfile[];
  /** The baby whose entries are on screen, or `all`. */
  selected: string;
  onSelect: (id: string) => void;
}

/**
 * The row above the timeline: every baby, one chip each, and "all" first.
 *
 * One baby needs no switcher, so the page only renders this from two up.
 */
const BabySwitcher = ({ profiles, selected, onSelect }: BabySwitcherProps) => {
  const chipClass = (isActive: boolean) =>
    `flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
      isActive
        ? 'border-forest bg-sage-light font-medium text-forest'
        : 'border-border bg-surface text-ink hover:bg-cream'
    }`;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect('all')}
        aria-pressed={selected === 'all'}
        className={chipClass(selected === 'all')}
      >
        כולם
      </button>

      {profiles.map((profile) => (
        <button
          key={profile.id}
          type="button"
          onClick={() => onSelect(profile.id)}
          aria-pressed={selected === profile.id}
          className={chipClass(selected === profile.id)}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${babyColorTokens(profile.color).dot}`}
            aria-hidden="true"
          />
          {profile.displayName}
        </button>
      ))}
    </div>
  );
};

export default BabySwitcher;
