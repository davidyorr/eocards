import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		vue(),
		VitePWA({
			filename: "service-worker.js",
			registerType: "autoUpdate",
			includeAssets: ["favicon.ico", "apple-touch-icon.png", "favicon.svg"],
			manifest: {
				name: "Eocards",
				short_name: "Eocards",
				description: "To me, this deck has been memorized for centuries",
				theme_color: "#ffffff",
				background_color: "#ffffff",
				display: "standalone",
				orientation: "portrait",
				icons: [
					{
						src: "web-app-manifest-192x192.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any maskable",
					},
					{
						src: "web-app-manifest-512x512.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any maskable",
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		host: "localhost",
		port: 8080,
		strictPort: true,
		hmr: {
			protocol: "ws",
			host: "localhost",
			port: 8080,
		},
	},
});
