import { ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title?: string;
  message?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({
  open,
  title = "Onay",
  message = "Bu işlemi yapmak istediğine emin misin?",
  confirmText = "Evet",
  cancelText = "Vazgeç",
  onConfirm,
  onClose,
}: Props) {
  if (!open) return null;

  return createPortal(
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-sheet" role="dialog" aria-modal="true">
        <h3 className="modal-title">{title}</h3>
        <div className="modal-body">{message}</div>
        <div className="modal-actions">
          <button className="btn btn--ghost" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className="btn btn--primary"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
