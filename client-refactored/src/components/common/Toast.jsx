function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <button className={`toast toast-${toast.type}`} onClick={onClose}>
      {toast.message}
    </button>
  );
}

export default Toast;
