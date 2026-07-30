"use client";

import { useEffect } from "react";

export type NotificationMessage = {
  id: number;
  text: string;
};

function NotificationItem({
  item,
  onDismiss,
}: {
  item: NotificationMessage;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(item.id), 1000);
    return () => window.clearTimeout(timer);
  }, [item.id, onDismiss]);

  return <div className="notificationItem">{item.text}</div>;
}

export default function Notifications({
  items,
  onDismiss,
}: {
  items: NotificationMessage[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="notificationStack" aria-live="polite" aria-atomic="false">
      {items.map((item) => (
        <NotificationItem key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
