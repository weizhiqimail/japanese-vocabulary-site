import { Center, Portal, Spinner, Text, VStack } from '@chakra-ui/react';

/** 覆盖整个页面的操作锁，避免查询和增删改期间重复提交。 */
export function PageLoading({
  visible,
  label = '处理中…',
}: {
  visible: boolean;
  label?: string;
}) {
  if (!visible) {
    return null;
  }

  return (
    <Portal>
      <Center
        position="fixed"
        inset={0}
        bg="whiteAlpha.800"
        backdropFilter="blur(2px)"
        zIndex="toast"
      >
        <VStack
          bg="white"
          borderWidth="1px"
          borderColor="brand.200"
          borderRadius="xl"
          px={10}
          py={8}
          shadow="lg"
        >
          <Spinner size="xl" color="brand.500" thickness="4px" />
          <Text color="slate.700" fontWeight="600">
            {label}
          </Text>
        </VStack>
      </Center>
    </Portal>
  );
}
