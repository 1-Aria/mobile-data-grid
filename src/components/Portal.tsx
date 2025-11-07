import { createPortal } from 'react-dom';

const Portal = ({ children }: { children: React.ReactNode }) => {
  if (typeof document === 'undefined') return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(children, modalRoot);
};

export default Portal;
