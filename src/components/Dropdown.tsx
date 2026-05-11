import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  dropdownClassName?: string;
  dropdownStyle?: React.CSSProperties;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dropdown({ 
  trigger, 
  children, 
  className = "", 
  dropdownClassName = "",
  dropdownStyle,
  isOpen: externalIsOpen,
  onOpenChange
}: DropdownProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    else setInternalIsOpen(val);
  };

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mousePos = useRef({ x: 0, y: 0, t: 0 });
  const velocity = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mousePos.current.x;
      const dy = e.clientY - mousePos.current.y;
      const dt = Date.now() - mousePos.current.t;
      velocity.current = Math.sqrt(dx * dx + dy * dy) / (dt || 1);
      mousePos.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // If high velocity, close immediately
    if (velocity.current > 1.2) {
      setIsOpen(false);
    } else {
      // Grace period
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 400); // 400ms grace period
    }
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer h-full flex items-center">
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`absolute z-[150] ${dropdownClassName}`}
            style={dropdownStyle ? { pointerEvents: 'auto', ...dropdownStyle } : { pointerEvents: 'auto' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
