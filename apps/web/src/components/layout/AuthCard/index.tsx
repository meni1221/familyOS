import type { ReactNode } from 'react';
import BrandLogo from '../../ui/BrandLogo';

interface AuthCardProps {
  title: string;
  subtitle: string;
  /** The server's message, shown above the form when a request failed. */
  error: string;
  children: ReactNode;
}

/** The centred card the login and register screens share. */
const AuthCard = ({ title, subtitle, error, children }: AuthCardProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <BrandLogo to="/" size="md" />
        </div>
        <div className="card">
          <h1 className="mb-1 text-center text-xl font-bold text-ink">{title}</h1>
          <p className="mb-6 text-center text-sm text-ink-secondary">{subtitle}</p>
          {error && <div className="mb-4 rounded-4 bg-red-50 p-3 text-sm text-error">{error}</div>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
