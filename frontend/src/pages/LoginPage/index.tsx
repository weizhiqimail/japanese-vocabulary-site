import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate(search.get("from") || "/", { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Center minH="100vh" bg="brand.50" px={4}>
      <Box
        as="form"
        onSubmit={submit}
        bg="white"
        p={{ base: 6, md: 9 }}
        rounded="2xl"
        shadow="lg"
        w="full"
        maxW="420px"
      >
        <Stack spacing={5}>
          <Box>
            <Heading size="lg" color="brand.600">
              日本語言葉勉強
            </Heading>
            <Text color="gray.600" mt={2}>
              登录后进入个人日语知识库
            </Text>
          </Box>
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <FormControl isRequired>
            <FormLabel>用户名</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>密码</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </FormControl>
          <Button type="submit" isLoading={loading} size="lg">
            登录
          </Button>
        </Stack>
      </Box>
    </Center>
  );
}
