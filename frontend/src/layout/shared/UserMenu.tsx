import {
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageLoading } from '@/components/common/PageLoading';
import { useAuth } from '@/contexts/AuthContext';

/** 词汇与做题布局共用的个人中心入口。 */
export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const exit = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <Menu placement="bottom-end">
        <MenuButton
          as={Button}
          size="sm"
          variant="ghost"
          color="slate.700"
          isDisabled={loggingOut}
        >
          {user?.displayName || user?.username || '个人中心'} ▾
        </MenuButton>
        <MenuList minW="150px">
          <MenuItem as={Link} to="/w/words">
            词汇
          </MenuItem>
          <MenuItem as={Link} to="/q/questions">
            做题
          </MenuItem>
          <MenuDivider />
          <MenuItem color="red.600" onClick={() => void exit()}>
            退出
          </MenuItem>
        </MenuList>
      </Menu>
      <PageLoading visible={loggingOut} label="正在退出…" />
    </>
  );
}
