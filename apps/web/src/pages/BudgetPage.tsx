import { Plus, Wallet } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

export default function BudgetPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">תקציב משפחתי</h1>
        <button className="btn-primary btn-sm">
          <Plus className="h-4 w-4" />
          הוצאה חדשה
        </button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-label mb-1">הוצאות החודש</p>
          <p className="text-2xl font-bold text-error text-numeric">₪0</p>
        </div>
        <div className="card">
          <p className="text-label mb-1">תקציב חודשי</p>
          <p className="text-2xl font-bold text-ink text-numeric">₪0</p>
        </div>
        <div className="card">
          <p className="text-label mb-1">נותר</p>
          <p className="text-2xl font-bold text-success text-numeric">₪0</p>
        </div>
      </div>

      <div className="card">
        <EmptyState
          icon={Wallet}
          title="אין נתונים עדיין"
          description="התחילו להזין הוצאות והכנסות כדי לראות סטטיסטיקות"
        />
      </div>
    </div>
  );
}
