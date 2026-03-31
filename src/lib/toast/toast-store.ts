"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  title: string;
  tone: ToastTone;
};

type ToastState = {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => string;
  dismissToast: (id: string) => void;
};

const createToastId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (toast) => {
    const id = createToastId();

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));

export const toast = {
  success(title: string) {
    return useToastStore.getState().showToast({ title, tone: "success" });
  },
  error(title: string) {
    return useToastStore.getState().showToast({ title, tone: "error" });
  },
  info(title: string) {
    return useToastStore.getState().showToast({ title, tone: "info" });
  },
  dismiss(id: string) {
    useToastStore.getState().dismissToast(id);
  },
};
