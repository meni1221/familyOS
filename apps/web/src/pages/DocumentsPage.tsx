import { Plus, FileText, Upload } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';

export default function DocumentsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">מסמכים</h1>
        <button className="btn-primary btn-sm">
          <Plus className="h-4 w-4" />
          העלה מסמך
        </button>
      </div>

      <div className="card">
        <EmptyState
          icon={FileText}
          title="אין מסמכים"
          description="העלו מסמכים חשובים כדי לשמור עליהם במקום אחד ומאובטח"
          action={
            <button className="btn-secondary btn-sm">
              <Upload className="h-4 w-4" />
              העלה מסמך ראשון
            </button>
          }
        />
      </div>
    </div>
  );
}
