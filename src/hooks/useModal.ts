import { useState, useCallback } from "react";

interface UseModalReturn<T = any> {
  isOpen: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
}

export function useModal<T = any>(initialOpen = false): UseModalReturn<T> {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((modalData?: T) => {
    if (modalData !== undefined) {
      setData(modalData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setData(null);
    }
  }, [isOpen]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}

// 여러 모달을 관리하는 훅
export function useModals<T extends Record<string, any>>(
  modalNames: (keyof T)[]
): Record<keyof T, UseModalReturn<T[keyof T]>> {
  const modals = {} as Record<keyof T, UseModalReturn<T[keyof T]>>;

  modalNames.forEach((name) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    modals[name] = useModal<T[keyof T]>();
  });

  return modals;
}
