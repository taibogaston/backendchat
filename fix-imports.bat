@echo off
echo 🔧 Corrigiendo imports de módulos...

REM Corregir el import en ai.service.js
if exist "dist\services\ai.service.js" (
    powershell -Command "(Get-Content 'dist\services\ai.service.js') -replace 'require(\"\.\/character\.service\")', 'require(\".\/character.service.js\")' | Set-Content 'dist\services\ai.service.js'"
    echo ✅ Corregido ai.service.js
)

echo ✅ Corrección de imports completada
