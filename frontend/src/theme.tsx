import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        red: { value: "#EE0F0F" },

        ui: {
          wfhandlecolor: { value: "#3182ce" },
          main: { value: "#fff" },
        },
      },
    },

    // optional: semantic tokens
    semanticTokens: {
      colors: {
        danger: { value: "{colors.red}" },

        // ví dụ nếu bạn muốn semantic token:
        handleColor: { value: "{colors.ui.wfhandlecolor}" },
      },
    },
  },
});

export default createSystem(defaultConfig, config);
