import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

const isGitHubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "ShindaiMap";
const repositoryOwner = process.env.GITHUB_REPOSITORY_OWNER || "I-H-dot";
const isUserSite = repositoryName.toLowerCase() === `${repositoryOwner.toLowerCase()}.github.io`;
const githubPagesOrigin = `https://${repositoryOwner.toLowerCase()}.github.io`;
const githubPagesBase = isUserSite ? "/" : `/${repositoryName}`;

export default defineConfig({
  site:
    process.env.SITE_ORIGIN ||
    (isGitHubActions ? githubPagesOrigin : "http://localhost:4321"),
  base:
    process.env.BASE_PATH ||
    (isGitHubActions ? githubPagesBase : "/"),
  integrations: [react(), sitemap()],
  output: "static",
  vite: {
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"]
    }
  },
  build: {
    assets: "_assets"
  }
});
