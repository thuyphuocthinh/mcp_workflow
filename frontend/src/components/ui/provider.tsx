import { type ReactNode } from "react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

type PropsWithChildren = ColorModeProviderProps & {
  children: ReactNode;
};

export function Provider({ children, ...props }: PropsWithChildren) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props}>{children}</ColorModeProvider>
    </ChakraProvider>
  );
}
