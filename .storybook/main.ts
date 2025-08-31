import type { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";

const root = process.cwd();

const config: StorybookConfig = {
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  stories: [
    "../src/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],
  addons: [
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-vitest"
  ],
  docs: {
    defaultName: 'Docs'
  },
  viteFinal: async (config) => {
    // Vite alias를 스토리북에도 반영 (Windows 대응)
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(root, "src"),
      "@components": path.resolve(root, "src/components"),
      "@pages": path.resolve(root, "src/pages"),
      "@hooks": path.resolve(root, "src/hooks"),
      "@stores": path.resolve(root, "src/stores"),
      "@services": path.resolve(root, "src/services"),
      "@utils": path.resolve(root, "src/utils"),
      "@types": path.resolve(root, "src/types"),
    };
    return config;
  }
};

export default config;
