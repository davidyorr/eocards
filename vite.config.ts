import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Icons from "unplugin-icons/vite";

export default defineConfig({
	plugins: [
		vue(),
		Icons({
			compiler: "vue3",
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
