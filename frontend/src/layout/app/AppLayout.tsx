import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
  Spacer,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { PageLoading } from "@/components/common/PageLoading";
import { useAuth } from "@/contexts/AuthContext";
import { MANAGEMENT_ITEMS, NAV_ITEMS, WORD_ITEMS } from "./config";

function NavigationBreadcrumb({
  mobile = false,
  close,
}: {
  mobile?: boolean;
  close?: () => void;
}) {
  return (
    <Breadcrumb
      separator={mobile ? "" : "·"}
      display={mobile ? "block" : "flex"}
      spacing={mobile ? 0 : 2}
    >
      {NAV_ITEMS.map((item) => (
        <BreadcrumbItem
          key={item.path}
          display={mobile ? "block" : "flex"}
          mb={mobile ? 2 : 0}
        >
          <BreadcrumbLink
            as={NavLink}
            to={item.path}
            onClick={close}
            px={3}
            py={2}
            borderRadius="md"
            fontWeight="600"
            color="slate.600"
            _activeLink={{ bg: "brand.100", color: "brand.800" }}
            _hover={{ bg: "brand.50", textDecoration: "none" }}
          >
            {item.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}

function ManagementBreadcrumb() {
  return (
    <Breadcrumb
      separator="/"
      mb={{ base: 6, md: 8 }}
      borderBottomWidth="1px"
      borderColor="brand.100"
      pb={3}
    >
      {MANAGEMENT_ITEMS.map((item) => (
        <BreadcrumbItem key={item.path}>
          <BreadcrumbLink
            as={NavLink}
            to={item.path}
            _activeLink={{ color: "brand.700", fontWeight: "700" }}
          >
            {item.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}

function WordsBreadcrumb() {
  return (
    <Breadcrumb
      separator="·"
      mb={{ base: 5, md: 7 }}
      overflowX="auto"
      whiteSpace="nowrap"
    >
      {WORD_ITEMS.map((item) => (
        <BreadcrumbItem key={item.path}>
          <BreadcrumbLink
            as={NavLink}
            to={item.path}
            _activeLink={{ color: "brand.700", fontWeight: "700" }}
          >
            {item.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}

export function AppLayout() {
  const drawer = useDisclosure();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const exit = async () => {
    setLoggingOut(true);

    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

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
          h={{ base: "64px", lg: "72px" }}
          px={{ base: 4, md: 6, xl: 8 }}
          align="center"
        >
          <IconButton
            display={{ base: "inline-flex", lg: "none" }}
            aria-label="打开菜单"
            mr={3}
            onClick={drawer.onOpen}
            icon={<Text fontSize="xl">☰</Text>}
          />
          <Text
            as={Link}
            to="/words"
            flexShrink={0}
            mr={{ lg: 8 }}
            fontWeight="800"
            fontSize={{ base: "lg", xl: "2xl" }}
            color="brand.700"
          >
            日本語言葉勉強
          </Text>
          <Box display={{ base: "none", lg: "block" }}>
            <NavigationBreadcrumb />
          </Box>
          <Spacer />
          <HStack spacing={3}>
            <Text display={{ base: "none", sm: "block" }} color="slate.600">
              {user?.displayName}
            </Text>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void exit()}
              isDisabled={loggingOut}
            >
              退出
            </Button>
          </HStack>
        </Flex>
      </Box>
      <Container
        maxW="1680px"
        py={{ base: 6, md: 10 }}
        px={{ base: 4, md: 7, xl: 8 }}
      >
        {location.pathname.startsWith("/words") && <WordsBreadcrumb />}
        {location.pathname.startsWith("/words/manage") && (
          <ManagementBreadcrumb />
        )}
        <Outlet />
      </Container>
      <Drawer isOpen={drawer.isOpen} placement="left" onClose={drawer.onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader color="brand.700">日本語言葉勉強</DrawerHeader>
          <DrawerBody>
            <NavigationBreadcrumb mobile close={drawer.onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <PageLoading visible={loggingOut} label="正在退出…" />
    </Box>
  );
}
