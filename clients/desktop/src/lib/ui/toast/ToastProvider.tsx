import { createContext, useCallback, useEffect, useState } from 'react';

import { ChildrenProp } from '../props';
import { createContextHook } from '../state/createContextHook';
import { ToastItem } from './ToastItem';

type Toast = {
  createdAt: number;
  message: string;
  duration: number;
};

type AddToastParams = Pick<Toast, 'message'> & Partial<Pick<Toast, 'duration'>>;

type ToastContextState = {
  addToast: (params: AddToastParams) => void;
};

const toastDefaultDuration = 3000;

const ToastContext = createContext<ToastContextState | undefined>(undefined);

export const ToastProvider = ({ children }: ChildrenProp) => {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timeout = setTimeout(
      () => {
        setToast(null);
      },
      toast.createdAt + toast.duration - Date.now()
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [toast]);

  const addToast: ToastContextState['addToast'] = useCallback(
    ({ message, duration = toastDefaultDuration }) => {
      setToast({
        createdAt: Date.now(),
        message,
        duration,
      });
    },
    []
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {toast && <ToastItem>{toast.message}</ToastItem>}
    </ToastContext.Provider>
  );
};

export const useToast = createContextHook(ToastContext, 'ToastContext');
