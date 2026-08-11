import { Button, Flex, Heading, Text, VStack } from "@chakra-ui/react";
export function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Flex
      mb={6}
      align={{ base: "stretch", md: "center" }}
      justify="space-between"
      gap={4}
      direction={{ base: "column", md: "row" }}
    >
      <VStack align="start" spacing={1}>
        <Heading size="lg">{title}</Heading>
        {description && <Text color="gray.600">{description}</Text>}
      </VStack>
      {actionLabel && (
        <Button alignSelf={{ base: "stretch", md: "auto" }} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Flex>
  );
}
