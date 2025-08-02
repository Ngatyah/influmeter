/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Influmeter Custom Colors
        primary: {
          DEFAULT: "#2E3A59", // Kenyan Indigo
          foreground: "#FFFFFF",
          dark: "#3F51B5", // Dark mode variant
        },
        accent: {
          DEFAULT: "#F4B400", // Tuscan Yellow
          foreground: "#202124", // Use charcoal text on yellow for better contrast
        },
        success: {
          DEFAULT: "#34A853", // Emerald Green
          foreground: "#FFFFFF",
        },
        error: {
          DEFAULT: "#EA4335", // Flame Red
          foreground: "#FFFFFF",
          dark: "#FF6E6E", // Dark mode variant
        },
        background: {
          DEFAULT: "#FAFAFA", // Cloud White
          dark: "#121212", // Almost Black
        },
        foreground: {
          DEFAULT: "#202124", // Charcoal
          dark: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F5F5F5", // Light grey for backgrounds
          foreground: "#5F6368", // Grey for text
          dark: "#AAAAAA",
        },
        // ShadCN Compatible Colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        'primary': ['Inter', 'sans-serif'],
        'secondary': ['Poppins', 'sans-serif'],
        'heading': ['Poppins', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'], // Make Inter the default sans font
      },
      fontSize: {
        'headline-1': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700' }], // 36px in rem
        'headline-2': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }], // 28px in rem
        'subtitle': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '500' }], // 20px in rem
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // 16px in rem
        'caption': ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '400' }], // 13px in rem
      },
      spacing: {
        'base': '0.5rem', // 8px in rem
        'card': '1rem', // 16px in rem
        'section': '2rem', // 32px in rem
        'button': '0.75rem 1.5rem', // 12px 24px for button padding
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
