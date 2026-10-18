import { IconPlus, IconFileText, IconUpload } from '@tabler/icons-react';
import EmptyState from '../components/ui/EmptyState';

export default function DocumentsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">מסמכים</h1>
        <button className="btn-primary btn-sm">
          <IconPlus className="h-4 w-4" />
          העלה מסמך
        </button>
      </div>

      <div className="card">
        <EmptyState
          icon={IconFileText}
          title="אין מסמכים"
          description="העלו מסמכים חשובים כדי לשמור עליהם במקום אחד ומאובטח"
          action={
            <button className="btn-secondary btn-sm">
              <IconUpload className="h-4 w-4" />
              העלה מסמך ראשון
            </button>
          }
        />
      </div>
    </div>
  );
}
