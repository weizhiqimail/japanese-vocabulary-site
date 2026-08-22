import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Container,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Spacer,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { UserMenu } from '@/layout/shared/UserMenu';
import { MANAGEMENT_ITEMS, WORD_ITEMS } from './config';

function WordsNavigation({ close }: { close?: () => void }) {
  return (
    <Breadcrumb separator="·" overflowX="auto" whiteSpace="nowrap">
      {WORD_ITEMS.map((item) => (
        <BreadcrumbItem key={item.path}>
          <BreadcrumbLink
            as={NavLink}
            to={item.path}
            onClick={close}
            _activeLink={{ color: 'brand.700', fontWeight: '700' }}
          >
            {item.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}

function ManagementNavigation() {
  return (
    <Breadcrumb
      separator="/"
      mb={{ base: 6, md: 8 }}
      pb={3}
      borderBottomWidth="1px"
      borderColor="brand.100"
    >
      {MANAGEMENT_ITEMS.map((item) => (
        <BreadcrumbItem key={item.path}>
          <BreadcrumbLink
            as={NavLink}
            to={item.path}
            _activeLink={{ color: 'brand.700', fontWeight: '700' }}
          >
            {item.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}

/** 仅承载词汇模块的布局。 */
export function WordsLayout() {
  const drawer = useDisclosure();
  const location = useLocation();

  return (
    <Box minH="100vh">
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
          maxW="1680px"
          mx="auto"
          h={{ base: '64px', lg: '72px' }}
          px={{ base: 4, md: 6, xl: 8 }}
          align="center"
        >
          <IconButton
            display={{ base: 'inline-flex', lg: 'none' }}
            aria-label="打开词汇菜单"
            mr={3}
            onClick={drawer.onOpen}
            icon={<Text fontSize="xl">☰</Text>}
          />
          <Text
            as={Link}
            to="/w/words"
            flexShrink={0}
            mr={{ lg: 8 }}
            fontWeight="800"
            fontSize={{ base: 'lg', xl: '2xl' }}
            color="brand.700"
          >
            dazi study
          </Text>
          <Box display={{ base: 'none', lg: 'block' }}>
            <WordsNavigation />
          </Box>
          <Spacer />
          <UserMenu />
        </Flex>
      </Box>
      <Container
        maxW="1680px"
        py={{ base: 6, md: 10 }}
        px={{ base: 4, md: 7, xl: 8 }}
      >
        {location.pathname.startsWith('/w/words/manage') && (
          <ManagementNavigation />
        )}
        <Outlet />
      </Container>
      <Drawer isOpen={drawer.isOpen} placement="left" onClose={drawer.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader color="brand.700">词汇模块</DrawerHeader>
          <DrawerBody>
            <WordsNavigation close={drawer.onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
