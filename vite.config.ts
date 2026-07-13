import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Deployed to GitHub Pages under /BeatSampler/ (ADR 0001: static site, no backend).
export default defineConfig({
  base: "/BeatSampler/",
  plugins: [react()],
});
