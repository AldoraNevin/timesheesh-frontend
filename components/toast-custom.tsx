import React, { useEffect, useRef, useState } from 'react';

interface ToastCustomProps {
  open: boolean;
  onClose: () => void;
  message: string;
  type: 'success' | 'info' | 'default' | null;
}

const COLORS = {
  success: 'bg-green-600',
  info: 'bg-blue-600',
  default: 'bg-gray-800',
};

const ToastCustom: React.FC<ToastCustomProps> = ({ open, onClose, message, type }) => {
  const [visible, setVisible] = useState(open);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const startX = useRef<number | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setVisible(open);
    setFadeOut(false);
    if (open) {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
      closeTimeout.current = setTimeout(() => {
        setFadeOut(true);
      }, 2200); // Lancement de l'animation avant la fermeture réelle
    }
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, [open]);

  // Quand fadeOut passe à true, on ferme vraiment après l'animation
  useEffect(() => {
    if (fadeOut && visible) {
      const timeout = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [fadeOut, visible, onClose]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    startX.current = e.clientX - x;
    document.body.style.userSelect = 'none';
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    setX(e.clientX - (startX.current ?? 0));
  };
  const handleMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = '';
  };
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line
  }, [dragging]);

  if (!visible) return null;

  return (
    <div
      ref={toastRef}
      className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-semibold flex items-center gap-3 transition-all duration-350 cursor-grab select-none
        ${COLORS[type ?? 'default']} 
        ${fadeOut ? 'opacity-0 translate-x-20 pointer-events-none' : 'opacity-100 translate-x-0'}
      `}
      style={{
        minWidth: 240,
        textAlign: 'center',
        transform: `translateX(${x}px)`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      }}
      onMouseDown={handleMouseDown}
      role="alert"
      aria-live="assertive"
    >
      {/* Icone selon le type */}
      <span className="text-xl">
        {type === 'success' && '✅'}
        {type === 'info' && 'ℹ️'}
        {type === 'default' && '⏱️'}
      </span>
      <span className="flex-1 text-base" style={{wordBreak:'break-word'}}>{message}</span>
      <button
        onClick={() => {
          setFadeOut(true);
          setTimeout(() => {
            setVisible(false);
            onClose();
          }, 350);
        }}
        className="ml-2 text-white/80 hover:text-white text-lg px-2 py-1 rounded transition-colors"
        aria-label="Fermer la notification"
        tabIndex={0}
        style={{background:'transparent', border:'none', outline:'none'}}
      >
        ×
      </button>
    </div>
  );
};

export default ToastCustom; 