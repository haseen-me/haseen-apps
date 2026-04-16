import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement;
}

const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const elRef = useRef<HTMLDivElement | null>(null);

  if (!elRef.current) {
    elRef.current = document.createElement('div');
  }

  useEffect(() => {
    const target = container ?? document.body;
    target.appendChild(elRef.current!);
    return () => {
      target.removeChild(elRef.current!);
    };
  }, [container]);

  return createPortal(children, elRef.current);
};

Portal.displayName = 'Portal';

export default Portal;
