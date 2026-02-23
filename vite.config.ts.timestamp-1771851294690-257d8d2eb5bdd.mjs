// vite.config.ts
import { defineConfig } from "file:///C:/Synaptix-Labs/projects/project-refiner/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Synaptix-Labs/projects/project-refiner/node_modules/@vitejs/plugin-react/dist/index.js";
import { crx } from "file:///C:/Synaptix-Labs/projects/project-refiner/node_modules/@crxjs/vite-plugin/dist/index.mjs";
import { resolve } from "path";

// manifest.json
var manifest_default = {
  manifest_version: 3,
  name: "SynaptixLabs Refine",
  description: "Record acceptance testing sessions, capture bugs, and export Playwright regression tests \u2014 all from your browser.",
  version: "1.0.0",
  permissions: [
    "activeTab",
    "storage",
    "tabs",
    "alarms",
    "downloads",
    "sidePanel",
    "scripting"
  ],
  host_permissions: [
    "<all_urls>"
  ],
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/content-script.ts"],
      run_at: "document_idle"
    }
  ],
  side_panel: {
    default_path: "src/sidepanel/sidepanel.html"
  },
  action: {
    default_title: "SynaptixLabs Refine",
    default_icon: {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  options_page: "src/options/options.html",
  commands: {
    "toggle-recording": {
      suggested_key: { default: "Ctrl+Shift+R", mac: "Command+Shift+R" },
      description: "Toggle recording (pause/resume)"
    },
    "capture-screenshot": {
      suggested_key: { default: "Ctrl+Shift+S", mac: "Command+Shift+S" },
      description: "Capture screenshot"
    },
    "open-bug-editor": {
      suggested_key: { default: "Ctrl+Shift+B", mac: "Command+Shift+B" },
      description: "Open bug editor"
    }
  },
  web_accessible_resources: [
    {
      resources: [
        "src/replay-viewer/replay-viewer.html",
        "src/new-session/new-session.html"
      ],
      matches: ["<all_urls>"]
    }
  ],
  icons: {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "C:\\Synaptix-Labs\\projects\\project-refiner";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest_default })
  ],
  resolve: {
    alias: {
      "@shared": resolve(__vite_injected_original_dirname, "src/shared"),
      "@core": resolve(__vite_injected_original_dirname, "src/core"),
      "@background": resolve(__vite_injected_original_dirname, "src/background"),
      "@content": resolve(__vite_injected_original_dirname, "src/content"),
      "@popup": resolve(__vite_injected_original_dirname, "src/popup"),
      "@changelog": resolve(__vite_injected_original_dirname, "CHANGELOG.md")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === "development",
    rollupOptions: {
      input: {
        "new-session": resolve(__vite_injected_original_dirname, "src/new-session/new-session.html"),
        "sidepanel": resolve(__vite_injected_original_dirname, "src/sidepanel/sidepanel.html")
      },
      output: {
        // Keep chunk names readable for extension debugging
        chunkFileNames: "assets/[name]-[hash].js"
      }
    }
  },
  // CRXJS handles HMR for extension development
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFN5bmFwdGl4LUxhYnNcXFxccHJvamVjdHNcXFxccHJvamVjdC1yZWZpbmVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxTeW5hcHRpeC1MYWJzXFxcXHByb2plY3RzXFxcXHByb2plY3QtcmVmaW5lclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovU3luYXB0aXgtTGFicy9wcm9qZWN0cy9wcm9qZWN0LXJlZmluZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgY3J4IH0gZnJvbSAnQGNyeGpzL3ZpdGUtcGx1Z2luJ1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgbWFuaWZlc3QgZnJvbSAnLi9tYW5pZmVzdC5qc29uJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBjcngoeyBtYW5pZmVzdCB9KSxcbiAgXSxcblxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAc2hhcmVkJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvc2hhcmVkJyksXG4gICAgICAnQGNvcmUnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb3JlJyksXG4gICAgICAnQGJhY2tncm91bmQnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9iYWNrZ3JvdW5kJyksXG4gICAgICAnQGNvbnRlbnQnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb250ZW50JyksXG4gICAgICAnQHBvcHVwJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvcG9wdXAnKSxcbiAgICAgICdAY2hhbmdlbG9nJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdDSEFOR0VMT0cubWQnKSxcbiAgICB9LFxuICB9LFxuXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgc291cmNlbWFwOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICAnbmV3LXNlc3Npb24nOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9uZXctc2Vzc2lvbi9uZXctc2Vzc2lvbi5odG1sJyksXG4gICAgICAgICdzaWRlcGFuZWwnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9zaWRlcGFuZWwvc2lkZXBhbmVsLmh0bWwnKSxcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgLy8gS2VlcCBjaHVuayBuYW1lcyByZWFkYWJsZSBmb3IgZXh0ZW5zaW9uIGRlYnVnZ2luZ1xuICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcblxuICAvLyBDUlhKUyBoYW5kbGVzIEhNUiBmb3IgZXh0ZW5zaW9uIGRldmVsb3BtZW50XG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBobXI6IHtcbiAgICAgIHBvcnQ6IDUxNzMsXG4gICAgfSxcbiAgfSxcbn0pXG4iLCAie1xuICBcIm1hbmlmZXN0X3ZlcnNpb25cIjogMyxcbiAgXCJuYW1lXCI6IFwiU3luYXB0aXhMYWJzIFJlZmluZVwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiUmVjb3JkIGFjY2VwdGFuY2UgdGVzdGluZyBzZXNzaW9ucywgY2FwdHVyZSBidWdzLCBhbmQgZXhwb3J0IFBsYXl3cmlnaHQgcmVncmVzc2lvbiB0ZXN0cyBcdTIwMTQgYWxsIGZyb20geW91ciBicm93c2VyLlwiLFxuICBcInZlcnNpb25cIjogXCIxLjAuMFwiLFxuXG4gIFwicGVybWlzc2lvbnNcIjogW1xuICAgIFwiYWN0aXZlVGFiXCIsXG4gICAgXCJzdG9yYWdlXCIsXG4gICAgXCJ0YWJzXCIsXG4gICAgXCJhbGFybXNcIixcbiAgICBcImRvd25sb2Fkc1wiLFxuICAgIFwic2lkZVBhbmVsXCIsXG4gICAgXCJzY3JpcHRpbmdcIlxuICBdLFxuXG4gIFwiaG9zdF9wZXJtaXNzaW9uc1wiOiBbXG4gICAgXCI8YWxsX3VybHM+XCJcbiAgXSxcblxuICBcImJhY2tncm91bmRcIjoge1xuICAgIFwic2VydmljZV93b3JrZXJcIjogXCJzcmMvYmFja2dyb3VuZC9zZXJ2aWNlLXdvcmtlci50c1wiLFxuICAgIFwidHlwZVwiOiBcIm1vZHVsZVwiXG4gIH0sXG5cbiAgXCJjb250ZW50X3NjcmlwdHNcIjogW1xuICAgIHtcbiAgICAgIFwibWF0Y2hlc1wiOiBbXCI8YWxsX3VybHM+XCJdLFxuICAgICAgXCJqc1wiOiBbXCJzcmMvY29udGVudC9jb250ZW50LXNjcmlwdC50c1wiXSxcbiAgICAgIFwicnVuX2F0XCI6IFwiZG9jdW1lbnRfaWRsZVwiXG4gICAgfVxuICBdLFxuXG4gIFwic2lkZV9wYW5lbFwiOiB7XG4gICAgXCJkZWZhdWx0X3BhdGhcIjogXCJzcmMvc2lkZXBhbmVsL3NpZGVwYW5lbC5odG1sXCJcbiAgfSxcblxuICBcImFjdGlvblwiOiB7XG4gICAgXCJkZWZhdWx0X3RpdGxlXCI6IFwiU3luYXB0aXhMYWJzIFJlZmluZVwiLFxuICAgIFwiZGVmYXVsdF9pY29uXCI6IHtcbiAgICAgIFwiMTZcIjogXCJpY29ucy9pY29uLTE2LnBuZ1wiLFxuICAgICAgXCIzMlwiOiBcImljb25zL2ljb24tMzIucG5nXCIsXG4gICAgICBcIjQ4XCI6IFwiaWNvbnMvaWNvbi00OC5wbmdcIixcbiAgICAgIFwiMTI4XCI6IFwiaWNvbnMvaWNvbi0xMjgucG5nXCJcbiAgICB9XG4gIH0sXG5cbiAgXCJvcHRpb25zX3BhZ2VcIjogXCJzcmMvb3B0aW9ucy9vcHRpb25zLmh0bWxcIixcblxuICBcImNvbW1hbmRzXCI6IHtcbiAgICBcInRvZ2dsZS1yZWNvcmRpbmdcIjoge1xuICAgICAgXCJzdWdnZXN0ZWRfa2V5XCI6IHsgXCJkZWZhdWx0XCI6IFwiQ3RybCtTaGlmdCtSXCIsIFwibWFjXCI6IFwiQ29tbWFuZCtTaGlmdCtSXCIgfSxcbiAgICAgIFwiZGVzY3JpcHRpb25cIjogXCJUb2dnbGUgcmVjb3JkaW5nIChwYXVzZS9yZXN1bWUpXCJcbiAgICB9LFxuICAgIFwiY2FwdHVyZS1zY3JlZW5zaG90XCI6IHtcbiAgICAgIFwic3VnZ2VzdGVkX2tleVwiOiB7IFwiZGVmYXVsdFwiOiBcIkN0cmwrU2hpZnQrU1wiLCBcIm1hY1wiOiBcIkNvbW1hbmQrU2hpZnQrU1wiIH0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiQ2FwdHVyZSBzY3JlZW5zaG90XCJcbiAgICB9LFxuICAgIFwib3Blbi1idWctZWRpdG9yXCI6IHtcbiAgICAgIFwic3VnZ2VzdGVkX2tleVwiOiB7IFwiZGVmYXVsdFwiOiBcIkN0cmwrU2hpZnQrQlwiLCBcIm1hY1wiOiBcIkNvbW1hbmQrU2hpZnQrQlwiIH0sXG4gICAgICBcImRlc2NyaXB0aW9uXCI6IFwiT3BlbiBidWcgZWRpdG9yXCJcbiAgICB9XG4gIH0sXG5cbiAgXCJ3ZWJfYWNjZXNzaWJsZV9yZXNvdXJjZXNcIjogW1xuICAgIHtcbiAgICAgIFwicmVzb3VyY2VzXCI6IFtcbiAgICAgICAgXCJzcmMvcmVwbGF5LXZpZXdlci9yZXBsYXktdmlld2VyLmh0bWxcIixcbiAgICAgICAgXCJzcmMvbmV3LXNlc3Npb24vbmV3LXNlc3Npb24uaHRtbFwiXG4gICAgICBdLFxuICAgICAgXCJtYXRjaGVzXCI6IFtcIjxhbGxfdXJscz5cIl1cbiAgICB9XG4gIF0sXG5cbiAgXCJpY29uc1wiOiB7XG4gICAgXCIxNlwiOiBcImljb25zL2ljb24tMTYucG5nXCIsXG4gICAgXCIzMlwiOiBcImljb25zL2ljb24tMzIucG5nXCIsXG4gICAgXCI0OFwiOiBcImljb25zL2ljb24tNDgucG5nXCIsXG4gICAgXCIxMjhcIjogXCJpY29ucy9pY29uLTEyOC5wbmdcIlxuICB9XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXFULFNBQVMsb0JBQW9CO0FBQ2xWLE9BQU8sV0FBVztBQUNsQixTQUFTLFdBQVc7QUFDcEIsU0FBUyxlQUFlOzs7QUNIeEI7QUFBQSxFQUNFLGtCQUFvQjtBQUFBLEVBQ3BCLE1BQVE7QUFBQSxFQUNSLGFBQWU7QUFBQSxFQUNmLFNBQVc7QUFBQSxFQUVYLGFBQWU7QUFBQSxJQUNiO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsRUFDRjtBQUFBLEVBRUEsa0JBQW9CO0FBQUEsSUFDbEI7QUFBQSxFQUNGO0FBQUEsRUFFQSxZQUFjO0FBQUEsSUFDWixnQkFBa0I7QUFBQSxJQUNsQixNQUFRO0FBQUEsRUFDVjtBQUFBLEVBRUEsaUJBQW1CO0FBQUEsSUFDakI7QUFBQSxNQUNFLFNBQVcsQ0FBQyxZQUFZO0FBQUEsTUFDeEIsSUFBTSxDQUFDLCtCQUErQjtBQUFBLE1BQ3RDLFFBQVU7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUFBLEVBRUEsWUFBYztBQUFBLElBQ1osY0FBZ0I7QUFBQSxFQUNsQjtBQUFBLEVBRUEsUUFBVTtBQUFBLElBQ1IsZUFBaUI7QUFBQSxJQUNqQixjQUFnQjtBQUFBLE1BQ2QsTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLElBQ1Q7QUFBQSxFQUNGO0FBQUEsRUFFQSxjQUFnQjtBQUFBLEVBRWhCLFVBQVk7QUFBQSxJQUNWLG9CQUFvQjtBQUFBLE1BQ2xCLGVBQWlCLEVBQUUsU0FBVyxnQkFBZ0IsS0FBTyxrQkFBa0I7QUFBQSxNQUN2RSxhQUFlO0FBQUEsSUFDakI7QUFBQSxJQUNBLHNCQUFzQjtBQUFBLE1BQ3BCLGVBQWlCLEVBQUUsU0FBVyxnQkFBZ0IsS0FBTyxrQkFBa0I7QUFBQSxNQUN2RSxhQUFlO0FBQUEsSUFDakI7QUFBQSxJQUNBLG1CQUFtQjtBQUFBLE1BQ2pCLGVBQWlCLEVBQUUsU0FBVyxnQkFBZ0IsS0FBTyxrQkFBa0I7QUFBQSxNQUN2RSxhQUFlO0FBQUEsSUFDakI7QUFBQSxFQUNGO0FBQUEsRUFFQSwwQkFBNEI7QUFBQSxJQUMxQjtBQUFBLE1BQ0UsV0FBYTtBQUFBLFFBQ1g7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBVyxDQUFDLFlBQVk7QUFBQSxJQUMxQjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLE9BQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxFQUNUO0FBQ0Y7OztBRGhGQSxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixJQUFJLEVBQUUsMkJBQVMsQ0FBQztBQUFBLEVBQ2xCO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxXQUFXLFFBQVEsa0NBQVcsWUFBWTtBQUFBLE1BQzFDLFNBQVMsUUFBUSxrQ0FBVyxVQUFVO0FBQUEsTUFDdEMsZUFBZSxRQUFRLGtDQUFXLGdCQUFnQjtBQUFBLE1BQ2xELFlBQVksUUFBUSxrQ0FBVyxhQUFhO0FBQUEsTUFDNUMsVUFBVSxRQUFRLGtDQUFXLFdBQVc7QUFBQSxNQUN4QyxjQUFjLFFBQVEsa0NBQVcsY0FBYztBQUFBLElBQ2pEO0FBQUEsRUFDRjtBQUFBLEVBRUEsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsV0FBVyxRQUFRLElBQUksYUFBYTtBQUFBLElBQ3BDLGVBQWU7QUFBQSxNQUNiLE9BQU87QUFBQSxRQUNMLGVBQWUsUUFBUSxrQ0FBVyxrQ0FBa0M7QUFBQSxRQUNwRSxhQUFhLFFBQVEsa0NBQVcsOEJBQThCO0FBQUEsTUFDaEU7QUFBQSxNQUNBLFFBQVE7QUFBQTtBQUFBLFFBRU4sZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBO0FBQUEsRUFHQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixLQUFLO0FBQUEsTUFDSCxNQUFNO0FBQUEsSUFDUjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
