interface SectionCardProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** Consistent wrapper for every settings block. */
const SectionCard = ({
  title,
  description,
  icon: Icon,
  action,
  children,
}: SectionCardProps) => {
  return (
    <section className="card">
      <div className="card-header">
        <div className="flex items-start gap-3">
          {Icon && (
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-4 bg-sand"
              aria-hidden="true"
            >
              <Icon className="h-5 w-5 text-ink-secondary" />
            </span>
          )}
          <div>
            <h2 className="card-title">{title}</h2>
            {description && <p className="text-xs text-ink-secondary">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
};

export default SectionCard;
