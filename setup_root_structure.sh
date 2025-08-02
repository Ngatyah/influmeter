#!/bin/bash

# Create root directories
mkdir -p backend/src
mkdir -p frontend/src
mkdir -p mobile
mkdir -p shared/{types,dtos,validators}
mkdir -p docs

# Create detailed backend structure
mkdir -p backend/src/{auth,users,influencers,brands,campaigns,content,discover,insights,payments,notifications,shared,database}
mkdir -p backend/test

# Create detailed frontend structure
mkdir -p frontend/src/components
mkdir -p frontend/src/screens/{auth,dashboard,campaign,discover,earnings,profile,settings}
mkdir -p frontend/src/{layouts,hooks,lib,context,router,assets,themes,types}
mkdir -p frontend/public

# Create detailed shared structure
mkdir -p shared/types
mkdir -p shared/dtos
mkdir -p shared/validators

# Create base files
touch .env
touch docker-compose.yml
touch README.md

echo "# Influmeter Platform" > README.md
echo "Connect influencers with brands seamlessly." >> README.md

# Create a basic docker-compose file for development
cat > docker-compose.yml << EOL
version: '3.8'
services:
  postgres:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: influmeter
      POSTGRES_PASSWORD: password
      POSTGRES_DB: influmeter
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOL

# Create basic .env file
cat > .env << EOL
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=influmeter
DB_PASSWORD=password
DB_NAME=influmeter

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=1h

# API
API_PORT=3000
EOL

echo "Complete folder structure created successfully."
