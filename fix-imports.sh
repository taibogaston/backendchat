#!/bin/bash

# Script para corregir imports de módulos después de la compilación
echo "🔧 Corrigiendo imports de módulos..."

# Corregir el import en ai.service.js
if [ -f "dist/services/ai.service.js" ]; then
    # Reemplazar require("./character.service") con require("./character.service.js")
    sed -i 's/require("\.\/character\.service")/require(".\/character.service.js")/g' dist/services/ai.service.js
    echo "✅ Corregido ai.service.js"
fi

# Corregir otros posibles imports similares
find dist -name "*.js" -type f -exec sed -i 's/require("\.\/[^"]*")/&.js/g' {} \; 2>/dev/null || true

echo "✅ Corrección de imports completada"
