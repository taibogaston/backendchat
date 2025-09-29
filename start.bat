@echo off
echo 🔍 Verificando archivos compilados...

REM Verificar que el directorio dist existe
if not exist "dist" (
    echo ❌ Error: Directorio 'dist' no encontrado
    exit /b 1
)

REM Verificar archivos críticos
set "missing_files="

if not exist "dist\index.js" set "missing_files=%missing_files% dist\index.js"
if not exist "dist\services\ai.service.js" set "missing_files=%missing_files% dist\services\ai.service.js"
if not exist "dist\services\character.service.js" set "missing_files=%missing_files% dist\services\character.service.js"
if not exist "dist\services\email.service.js" set "missing_files=%missing_files% dist\services\email.service.js"
if not exist "dist\services\index.js" set "missing_files=%missing_files% dist\services\index.js"

if "%missing_files%"=="" (
    echo ✅ Todos los archivos necesarios están presentes
    echo 🚀 Iniciando servidor...
    node dist/index.js
) else (
    echo ❌ Archivos faltantes:%missing_files%
    echo 🔧 Recompilando proyecto...
    npm run build
    echo 🚀 Iniciando servidor...
    node dist/index.js
)
