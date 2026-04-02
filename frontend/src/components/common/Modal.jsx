const Modal = ({ open, title, onClose, children, width = "560px" }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section
        className="modal"
        style={{ maxWidth: width }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="ghost-btn" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
};

export default Modal;
