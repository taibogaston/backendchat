#!/bin/bash

# Script para poblar la base de datos con personajes
echo "🌱 Poblando base de datos con personajes..."

# Compilar el proyecto
echo "🔨 Compilando proyecto..."
npm run build

# Ejecutar migración
echo "🔄 Ejecutando migración de personajes..."
npx ts-node src/scripts/migrate-characters.ts

echo "✅ Base de datos poblada exitosamente"
