import Modal from './Modal';

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'Are you sure?', message }) => (
  <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
    <p className="text-sm text-slate-600 mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <button className="btn-secondary" onClick={onClose}>Cancel</button>
      <button className="btn-danger" onClick={onConfirm}>Delete</button>
    </div>
  </Modal>
);

export default ConfirmDialog;
