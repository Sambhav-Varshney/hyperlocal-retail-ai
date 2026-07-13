import { createContext, useCallback, useContext, useRef, useState } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toast, setToast] = useState(null);
  const [authModal, setAuthModal] = useState({
    open: false,
    target: "/login",
    message: "Please sign in to continue.",
  });
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  const openAuthModal = useCallback((target = "/login", message = "Please sign in to continue.") => {
    setAuthModal({ open: true, target, message });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal((current) => ({ ...current, open: false }));
  }, []);

  return (
    <UIContext.Provider
      value={{ toast, showToast, closeToast, authModal, openAuthModal, closeAuthModal }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within a UIProvider");
  return context;
}
