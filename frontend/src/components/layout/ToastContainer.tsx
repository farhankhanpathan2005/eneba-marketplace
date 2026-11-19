import { useToast } from '../../hooks/useDebounce'

export default function ToastContainer() {
  const list = useToast()
  if (list.length === 0) return null
  return (
    <div className="toast-container">
      {list.map((t: { id: number; message: string; type: string }) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}