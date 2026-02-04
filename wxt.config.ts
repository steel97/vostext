import { defineConfig } from "wxt";
import ui from "@nuxt/ui/vite";

export default defineConfig({
  manifest: {
    // public key
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6FHeLDbhskvhe9e3sxi0Nz3on9VmRkVDGYRYY0Hb+yZjB/bq2VKr0d4msTNMEEYbiKAGykhj6EDGOfuSSEqkEM8JD9KSB87QnvRBH+Ov0isM3v9di5LgfRqUoTFN46kFYMoMgBel83xouV7ac3q7drI6A8ufvGLcQicC52rP5cctCQsQ2TxjhFPAJiPPuSB/0kLp3ibKIycV0GiBY/W7ZgVSyV0boZrDYNt8HxJHrevs9l6/DwUZh7xpbv2wUr2W0LYVt/0mr4m+gI0Zmy3Ay8J0Kh34vxe6w55uzNtCUK94nADngRWssfCmmFvHfS84LzuSeNufbx84h1IhfAXMvwIDAQAB",
    permissions: ["tabs"],
    browser_specific_settings: {
      gecko: {
        id: "{f52bdc6b-8297-44d0-9e98-e2d3b4e46dae}",
        // @ts-expect-error not exposed by wxt yet
        data_collection_permissions: {
          required: ["websiteContent", "websiteActivity", "browsingActivity"],
          optional: []
        }
      },
    }
  },
  srcDir: "./src",
  modules: ["@wxt-dev/module-vue"],
  vite(env) {
    const defines: Record<string, any> = {
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
    };
    return {
      define: defines,
      plugins: [
        ui()
      ]
    };
  },
});
