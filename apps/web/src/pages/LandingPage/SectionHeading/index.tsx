interface SectionHeadingProps {
  title: string;
  subtitle: string;
  /** A short label above the title, used to name the band of the page. */
  eyebrow?: string;
}

/** The centred heading every marketing section opens with. */
const SectionHeading = ({ title, subtitle, eyebrow }: SectionHeadingProps) => {
  return (
    <div className="mb-12 text-center">
      {eyebrow && (
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-canvas px-3 py-1 text-caption font-medium text-forest">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2 className="mb-2 text-3xl font-bold text-ink">{title}</h2>
      <p className="text-ink-secondary">{subtitle}</p>
    </div>
  );
};

export default SectionHeading;
