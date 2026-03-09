const fs = require('fs');

// Read tailwind.config.js
let tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');

// Replace colors section
const newColors = `
  		colors: {
  			background: "hsl(var(--background) / <alpha-value>)",
  			foreground: "hsl(var(--foreground) / <alpha-value>)",
  			card: {
  				DEFAULT: "hsl(var(--card) / <alpha-value>)",
  				foreground: "hsl(var(--card-foreground) / <alpha-value>)",
  			},
  			popover: {
  				DEFAULT: "hsl(var(--popover) / <alpha-value>)",
  				foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
  			},
  			primary: {
  				DEFAULT: "hsl(var(--primary) / <alpha-value>)",
  				foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
  			},
  			secondary: {
  				DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
  				foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
  			},
  			muted: {
  				DEFAULT: "hsl(var(--muted) / <alpha-value>)",
  				foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
  			},
  			accent: {
  				DEFAULT: "hsl(var(--accent) / <alpha-value>)",
  				foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
  			},
  			destructive: {
  				DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
  				foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
  			},
  			border: "hsl(var(--border) / <alpha-value>)",
  			input: "hsl(var(--input) / <alpha-value>)",
  			ring: "hsl(var(--ring) / <alpha-value>)",
  		},`;

tailwindConfig = tailwindConfig.replace(/colors:\s*\{[\s\S]*ring:\s*'var\(--ring\)',\r?\n\s*\},/, newColors.trim());
fs.writeFileSync('tailwind.config.js', tailwindConfig);

// Update index.css
let indexCss = fs.readFileSync('src/index.css', 'utf8');

const newLightMode = `
:root {
  --background: 210 40% 98%;
  --foreground: 0 0% 4%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 4%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 4%;
  --primary: 221 83% 53%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --accent: 210 40% 96%;
  --accent-foreground: 222 47% 11%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 210 40% 98%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 221 83% 53%;
`;

const newDarkMode = `
.dark {
  --background: 0 0% 6%;
  --foreground: 0 0% 93%;
  --card: 0 0% 9%;
  --card-foreground: 0 0% 93%;
  --popover: 0 0% 9%;
  --popover-foreground: 0 0% 93%;
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 13%;
  --secondary-foreground: 0 0% 93%;
  --muted: 0 0% 13%;
  --muted-foreground: 240 1% 60%;
  --accent: 0 0% 13%;
  --accent-foreground: 0 0% 93%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 16%;
  --input: 0 0% 16%;
  --ring: 217 91% 60%;
`;

indexCss = indexCss.replace(/:root\s*\{[\s\S]*?--ring:\s*[^;]+;/m, newLightMode.trim());
indexCss = indexCss.replace(/\.dark\s*\{[\s\S]*?--ring:\s*[^;]+;/m, newDarkMode.trim());

fs.writeFileSync('src/index.css', indexCss);
console.log('Fixed Tailwind Config and CSS');
