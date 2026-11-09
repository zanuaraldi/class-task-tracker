export interface ToastItem {
  id: number;
  message: string;
  type?: 'success' | 'error';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: 'min(420px, calc(100vw - 28px))',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.type === 'error' ? 'err' : ''}`}
          style={{ position: 'static', cursor: 'pointer' }}
          onClick={() => onDismiss(t.id)}
          title="Klik untuk menutup"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
