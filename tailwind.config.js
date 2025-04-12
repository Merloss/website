/** @type {import('tailwindcss').Config} */
export default {
	darkMode: "class",
	content: [
		"./components/**/*.{vue,js,ts,jsx,tsx}",
		"./layouts/**/*.{vue,js,ts,jsx,tsx}",
		"./pages/**/*.{vue,js,ts,jsx,tsx}",
		"./app.vue",
	],
	theme: {
		extend: {},
	},
	plugins: [require("@tailwindcss/typography")],
};
