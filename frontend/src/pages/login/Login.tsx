import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Input,
  Stack,
} from '@chakra-ui/react';
import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { InlineField } from '@/components/common/InlineField';
import { PageLoading } from '@/components/common/PageLoading';
import { useAuth } from '@/contexts/AuthContext';
import { LoginFooter } from './components/LoginFooter';
import { LoginHeader } from './components/LoginHeader';

/** 登录独立页面级组件。 */
export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await login(username, password);
      navigate(search.get('from') || '/w/words', { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '登录失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Center minH="100vh" bg="brand.50" px={4}>
      <Box
        as="form"
        onSubmit={submit}
        bg="white"
        borderWidth="1px"
        borderColor="brand.200"
        p={{ base: 6, md: 9 }}
        rounded="2xl"
        shadow="lg"
        w="full"
        maxW="560px"
      >
        <Stack spacing={6}>
          <LoginHeader />
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <InlineField label="用户名" isRequired>
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </InlineField>
          <InlineField label="密码" isRequired>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </InlineField>
          <Button type="submit" size="lg" isDisabled={busy}>
            登录
          </Button>
          <LoginFooter />
        </Stack>
      </Box>
      <PageLoading visible={busy} label="正在登录…" />
    </Center>
  );
}
