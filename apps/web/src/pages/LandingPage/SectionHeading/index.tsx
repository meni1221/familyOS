interface SectionHeadingProps {
  title: string;
  subtitle: string;
}

/** The centred heading every marketing section opens with. */
export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-12 text-center">
      <h2 className="mb-2 text-3xl font-bold text-ink">{title}</h2>
      <p className="text-ink-secondary">{subtitle}</p>
    </div>
  );
}
