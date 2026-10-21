import type { BabyColor, BabyProfile } from './types';

/**
 * Every colour a baby can be marked with, in the picker's order.
 *
 * The shared type is the source of truth: `BABY_COLOR_TOKENS` is a full record
 * of it, so a colour added there fails to compile here until it is given
 * tokens. The API accepts the same four names.
 */
export const BABY_COLORS = ['forest', 'gold', 'sage', 'ink'] as const;

interface BabyColorTokens {
  /** What the colour is called when it is offered. */
  label: string;
  /** A filled dot: the switcher chip and the timeline marker. */
  dot: string;
  /** A soft wash with the colour as ink: the avatar. */
  avatar: string;
}

export const BABY_COLOR_TOKENS: Record<BabyColor, BabyColorTokens> = {
  forest: { label: 'ירוק יער', dot: 'bg-forest', avatar: 'bg-sage-light text-forest' },
  gold: { label: 'זהב', dot: 'bg-gold', avatar: 'bg-gold-light text-ink' },
  sage: { label: 'מרווה', dot: 'bg-sage', avatar: 'bg-sage-light text-ink' },
  ink: { label: 'דיו', dot: 'bg-ink', avatar: 'bg-cream text-ink' },
};

/**
 * The tokens of a profile's colour. A profile saved before babies had colours
 * carries none at runtime, and lands on forest.
 */
export const babyColorTokens = (color: BabyColor | undefined): BabyColorTokens => {
  return BABY_COLOR_TOKENS[color ?? 'forest'] ?? BABY_COLOR_TOKENS.forest;
};

/** The letter on a baby's avatar. */
export const babyInitial = (profile: BabyProfile | null | undefined): string => {
  const name = profile?.displayName?.trim();
  return name ? (Array.from(name)[0] ?? '?') : '?';
};
