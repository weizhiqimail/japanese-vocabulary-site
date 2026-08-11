import {
  FormControl,
  FormLabel,
  Grid,
  type FormControlProps,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

interface InlineFieldProps extends FormControlProps {
  children: ReactNode;
  label: string;
}

/** 统一的 inline 表单布局：标签左侧、控件右侧并左对齐。 */
export function InlineField({ label, children, ...props }: InlineFieldProps) {
  return (
    <FormControl {...props}>
      <Grid
        templateColumns={{ base: "1fr", md: "140px minmax(0, 1fr)" }}
        gap={{ base: 2, md: 4 }}
        alignItems="start"
      >
        <FormLabel m={0} pt={{ base: 0, md: 2 }} textAlign="left">
          {label}
        </FormLabel>
        {children}
      </Grid>
    </FormControl>
  );
}
