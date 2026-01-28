import type { Config } from "tailwindcss"

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./lib/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: "#0b0f14",
                panel: "#121823",
                border: "#1f2937",
                text: "#e5e7eb",
                muted: "#9ca3af",
                accent: "#dc2626",
            },
        },
    },
    plugins: [],
}

export default config
