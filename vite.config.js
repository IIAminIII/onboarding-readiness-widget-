import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Zoho serves widget files from its own static host. A `crossorigin` module
 * script there can fail the CORS check and never execute, which leaves the
 * widget panel blank with no error in the page.
 */
function stripCrossOrigin() {
  return {
    name: "strip-crossorigin",
    enforce: "post",
    transformIndexHtml(html) {
      return html.replace(/\s+crossorigin(=(["']).*?\2)?/g, "");
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), stripCrossOrigin()],
  build: {
    // Conservative target: a syntax error in an older embedded browser would
    // stop the bundle before React ever mounts.
    target: "es2018",
    modulePreload: false,
  },
});
