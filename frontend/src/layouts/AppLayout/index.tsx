import {
  Box,
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { NAV_ITEMS } from "./config";
function Navigation({ close }: { close?: () => void }) {
  return (
    <VStack align="stretch" spacing={1}>
      {NAV_ITEMS.map((item) => (
        <Button
          key={item.path}
          as={NavLink}
          to={item.path}
          onClick={close}
          justifyContent="flex-start"
          variant="ghost"
          _activeLink={{ bg: "brand.100", color: "brand.700" }}
        >
          {item.label}
        </Button>
      ))}
    </VStack>
  );
}
export function AppLayout() {
  const drawer = useDisclosure();
  const { user, logout } = useAuth();
  return (
    <Flex minH="100vh">
      <Box
        display={{ base: "none", lg: "block" }}
        w="240px"
        bg="white"
        borderRightWidth="1px"
        p={5}
        position="fixed"
        insetY={0}
      >
        <Text
          as={Link}
          to="/"
          fontWeight="bold"
          fontSize="xl"
          color="brand.600"
        >
          日本語言葉勉強
        </Text>
        <Box mt={8}>
          <Navigation />
        </Box>
      </Box>
      <Box flex="1" ml={{ base: 0, lg: "240px" }}>
        <Flex
          as="header"
          h="64px"
          px={{ base: 4, md: 6 }}
          bg="white"
          borderBottomWidth="1px"
          align="center"
          justify="space-between"
          position="sticky"
          top={0}
          zIndex="sticky"
        >
          <HStack>
            <IconButton
              display={{ base: "inline-flex", lg: "none" }}
              aria-label="打开菜单"
              onClick={drawer.onOpen}
              icon={<Text fontSize="xl">☰</Text>}
            />
            <Text fontWeight="bold" color="brand.600">
              日本語言葉勉強
            </Text>
          </HStack>
          <HStack>
            <Text fontSize="sm" color="gray.600">
              {user?.displayName}
            </Text>
            <Button size="sm" variant="outline" onClick={() => void logout()}>
              退出
            </Button>
          </HStack>
        </Flex>
        <Container
          maxW="container.xl"
          py={{ base: 4, md: 7 }}
          px={{ base: 3, md: 6 }}
        >
          <Outlet />
        </Container>
      </Box>
      <Drawer isOpen={drawer.isOpen} placement="left" onClose={drawer.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader color="brand.600">日本語言葉勉強</DrawerHeader>
          <DrawerBody>
            <Navigation close={drawer.onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
