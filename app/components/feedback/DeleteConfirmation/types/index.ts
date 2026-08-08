export interface DeleteConfirmationProps {
  subject: string;
  busy: boolean;
  close: () => void;
  confirm: () => void;
  closeRequested?: boolean;
}
