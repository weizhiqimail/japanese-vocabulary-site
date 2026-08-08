import type { ReactNode } from "react";
export interface ModalProps {
  title: string;
  children: ReactNode;
  footer: ReactNode;
  close: () => void;
  size?: "sm" | "lg" | "xl";
  closeRequested?: boolean;
}
