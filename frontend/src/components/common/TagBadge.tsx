import { Badge } from "@chakra-ui/react";

/** 标签使用固定浅色背景和深色文字，保证在各知识页面可读。 */
export function TagBadge({
  color,
  children,
}: {
  color?: unknown;
  children: React.ReactNode;
}) {
  return (
    <Badge
      bg={String(color || "#FDE68A")}
      color="#3F2D18"
      borderRadius="full"
      px={3}
      py={1}
      textTransform="none"
    >
      {children}
    </Badge>
  );
}
