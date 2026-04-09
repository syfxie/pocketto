"use client";

import { useState, useEffect, useCallback } from "react";

interface ToastMessage {
  id: string;
  text: string;
}

let _toastListeners: ((msg: ToastMessage) => void)[] = [];

export function showToast(text: string) {
  const msg = { id: crypto.randomUUID(), text };
  _toastListeners.forEach((fn) => fn(msg));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const handleToast = useCallback((msg: ToastMessage) => {
    setToasts((prev) => [...prev, msg]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== msg.id));
    }, 2500);
  }, []);

  useEffect(() => {
    _toastListeners.push(handleToast);
    return () => {
      _toastListeners = _toastListeners.filter((fn) => fn !== handleToast);
    };
  }, [handleToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-neutral-800 text-white text-sm px-4 py-2 rounded-md shadow-sm animate-[fadeIn_0.2s_ease]"
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
