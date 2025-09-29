@echo off
echo 🌱 Poblando base de datos con personajes...

REM Compilar el proyecto
echo 🔨 Compilando proyecto...
npm run build

REM Ejecutar migración
echo 🔄 Ejecutando migración de personajes...
npx ts-node src/scripts/migrate-characters.ts

echo ✅ Base de datos poblada exitosamente
