import { extendTheme } from "@chakra-ui/react";
export const theme = extendTheme({
  colors: {
    brand: {
      50: "#eff8ff",
      100: "#dbeeff",
      200: "#b9ddff",
      300: "#88c5ff",
      400: "#55a8f4",
      500: "#318bd5",
      600: "#216fab",
      700: "#1d5988",
      800: "#1d4b70",
      900: "#1d405e",
    },
  },
  styles: {
    global: {
      body: { bg: "gray.50", color: "gray.800" },
      "*": { boxSizing: "border-box" },
    },
  },
  components: {
    Button: { defaultProps: { colorScheme: "brand" } },
    Input: { defaultProps: { focusBorderColor: "brand.400" } },
    Modal: { baseStyle: { dialog: { borderRadius: "xl" } } },
  },
});
