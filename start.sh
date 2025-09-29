#!/bin/bash

# Script para verificar que todos los archivos necesarios estén presentes
echo "🔍 Verificando archivos compilados..."

# Verificar que el directorio dist existe
if [ ! -d "dist" ]; then
    echo "❌ Error: Directorio 'dist' no encontrado"
    exit 1
fi

# Verificar archivos críticos
required_files=(
    "dist/index.js"
    "dist/services/ai.service.js"
    "dist/services/character.service.js"
    "dist/services/email.service.js"
    "dist/services/index.js"
    "dist/models/character.model.js"
    "dist/models/chat.model.js"
    "dist/models/message.model.js"
    "dist/models/user.model.js"
    "dist/routes/auth.routes.js"
    "dist/routes/character.routes.js"
    "dist/routes/chat.routes.js"
    "dist/routes/message.routes.js"
    "dist/routes/onboarding.routes.js"
    "dist/routes/user.routes.js"
    "dist/config/db.js"
    "dist/middleware/auth.middleware.js"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ Todos los archivos necesarios están presentes"
    echo "🚀 Iniciando servidor..."
    node dist/index.js
else
    echo "❌ Archivos faltantes:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    echo "🔧 Recompilando proyecto..."
    npm run build
    echo "🚀 Iniciando servidor..."
    node dist/index.js
fi
