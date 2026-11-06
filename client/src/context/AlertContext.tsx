import React, { createContext, useContext, useState } from 'react';

interface AlertContextType {
  showAlert: (message: string) => void;
}

const AlertContext = createContext<AlertContextType>({ showAlert: () => {} });

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);

  const showAlert = (msg: string) => setMessage(msg);
  const closeAlert = () => setMessage(null);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {message && (
        <div className="modal-backdrop" onClick={closeAlert}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Внимание</h3>
            <p>{message}</p>
            <button className="primary" onClick={closeAlert}>
              OK
            </button>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);