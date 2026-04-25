import { Button } from './Button.jsx';
import { Modal } from './Modal.jsx';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, description, confirmLabel = 'Confirm' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-extrabold text-white">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
