#!/bin/bash

echo "Setting up Influmeter Frontend..."

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Install Vite and development dependencies
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom

# Install additional Tailwind plugins
npm install -D tailwindcss-animate postcss

# Create components.json only if it doesn't exist
if [ ! -f "components.json" ]; then
    echo "Creating components.json..."
    cat > components.json << EOL
{
  "\$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
EOL
else
    echo "components.json already exists, skipping..."
fi

# Initialize shadcn/ui and add essential components
echo "Installing ShadCN/UI components..."
npx shadcn-ui@latest init --yes --deps
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add table

echo "Frontend setup complete!"
echo "Run 'cd frontend && npm run dev' to start the development server"
