import { extendTheme } from '@chakra-ui/react';

/** 修改这一组变量即可整体切换网站主色，不在业务组件中散落十六进制主题色。 */
export const THEME_PALETTE = {
  50: '#FFF9EB',
  100: '#FDECC8',
  200: '#FAD890',
  300: '#F6BE58',
  400: '#F0A52E',
  500: '#DE8616',
  600: '#B96611',
  700: '#934A13',
  800: '#793B17',
  900: '#663217',
} as const;

export const theme = extendTheme({
  colors: {
    brand: THEME_PALETTE,
    slate: {
      500: '#7C7164',
      600: '#62584D',
      700: '#473E35',
      800: '#2F2923',
    },
  },
  fonts: {
    body: 'Inter, "Noto Sans SC", "Microsoft YaHei", sans-serif',
    heading: 'Inter, "Noto Sans SC", "Microsoft YaHei", sans-serif',
  },
  styles: {
    global: {
      body: { bg: 'var(--jvs-page-bg)', color: 'slate.800' },
      '*': { boxSizing: 'border-box' },
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: 'brand' },
      baseStyle: { fontWeight: '600' },
    },
    Card: {
      baseStyle: {
        container: {
          borderWidth: '1px',
          borderColor: 'brand.100',
          borderRadius: 'xl',
          boxShadow: 'none',
        },
      },
    },
    Input: { defaultProps: { focusBorderColor: 'brand.400' } },
    Modal: { baseStyle: { dialog: { borderRadius: 'xl' } } },
  },
});
