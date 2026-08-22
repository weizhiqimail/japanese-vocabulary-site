import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { theme } from '@/config/theme';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppRoutes } from '@/routes';
import '@/styles/theme.less';

// 应用级 Provider 在入口处集中装配，页面组件只关注业务状态与交互。
ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
);
