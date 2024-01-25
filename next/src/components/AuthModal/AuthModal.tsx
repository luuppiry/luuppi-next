interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  return (
    <dialog
      className={`modal modal-bottom sm:modal-middle ${open && 'modal-open'}`}
      id="authModal"
    >
      <div className="modal-box">
        <h3 className="text-lg font-bold">Auth formi juttu</h3>
        <p className="py-4">Tähän tulee kirjautuminen :)</p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={onClose}>
              Sulje modal
            </button>
          </form>
        </div>
      </div>
      <form className="modal-backdrop" method="dialog">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
