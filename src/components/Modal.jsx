import React, { useEffect, useRef } from "react";
export default function Modal({ children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label="Gestión de inscripción"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <button className="close" aria-label="Cerrar" onClick={onClose}>
        ×
      </button>
      {children}
    </dialog>
  );
}
