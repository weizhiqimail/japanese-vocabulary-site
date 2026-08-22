import { Box, Container, Flex, Spacer, Text } from '@chakra-ui/react';
import { Link, Outlet } from 'react-router-dom';
import { UserMenu } from '@/layout/shared/UserMenu';

/** 仅承载做题模块的布局，与词汇布局完全分离。 */
export function QuestionsLayout() {
  return (
    <Box minH="100vh" bg="brand.50">
      <Box
        as="header"
        bg="white"
        borderBottomWidth="1px"
        borderColor="brand.100"
        position="sticky"
        top={0}
        zIndex="sticky"
      >
        <Flex
          maxW="1440px"
          mx="auto"
          h={{ base: '64px', lg: '72px' }}
          px={{ base: 4, md: 7 }}
          align="center"
        >
          <Text
            as={Link}
            to="/q/questions"
            fontWeight="800"
            fontSize={{ base: 'lg', md: '2xl' }}
            color="brand.700"
          >
            dazi study · 做题
          </Text>
          <Spacer />
          <UserMenu />
        </Flex>
      </Box>
      <Container maxW="1440px" py={{ base: 5, md: 9 }} px={{ base: 4, md: 7 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
