interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-cream p-4">
        <Icon className="h-6 w-6 text-ink-secondary" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mb-4 text-sm text-ink-secondary">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
