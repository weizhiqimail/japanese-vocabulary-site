import { Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';

/** 列表和管理页面统一标题区。 */
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
      align={{ base: 'stretch', md: 'center' }}
      justify="space-between"
      gap={4}
      direction={{ base: 'column', md: 'row' }}
    >
      <VStack align="start" spacing={1}>
        <Heading size="xl">{title}</Heading>
        {description && (
          <Text color="slate.500" fontSize={{ base: 'md', md: 'lg' }}>
            {description}
          </Text>
        )}
      </VStack>
      {actionLabel && (
        <Button alignSelf={{ base: 'stretch', md: 'auto' }} onClick={onAction}>
          ＋ {actionLabel}
        </Button>
      )}
    </Flex>
  );
}
