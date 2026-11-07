import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export interface ConfirmOptions {
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: async () => false,
});

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((result: boolean) => void) | null>(null);

  const settle = useCallback((result: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setOptions(null);
    resolve?.(result);
  }, []);

  const confirm = useCallback((next: ConfirmOptions) => {
    // Если диалог уже открыт, предыдущий запрос закрываем отказом
    resolverRef.current?.(false);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions(next);
    });
  }, []);

  const handleConfirm = useCallback(() => settle(true), [settle]);
  const handleCancel = useCallback(() => settle(false), [settle]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={options !== null}
        title={options?.title}
        message={options?.message}
        confirmLabel={options?.confirmLabel}
        cancelLabel={options?.cancelLabel}
        tone={options?.tone}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);
