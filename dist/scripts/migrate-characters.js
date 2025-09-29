"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const character_service_1 = require("../services/character.service");
dotenv_1.default.config();
async function migrateCharacters() {
    try {
        console.log("🔄 Iniciando migración de personajes...");
        // Conectar a la base de datos
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("✅ Conectado a MongoDB");
        // Sembrar personajes
        await character_service_1.CharacterService.seedCharacters();
        console.log("✅ Migración completada exitosamente");
        // Obtener estadísticas
        const characters = await character_service_1.CharacterService.getAllCharacters();
        console.log(`📊 Total de personajes: ${characters.length}`);
        // Mostrar personajes por idioma
        const stats = characters.reduce((acc, char) => {
            acc[char.idioma_objetivo] = (acc[char.idioma_objetivo] || 0) + 1;
            return acc;
        }, {});
        console.log("📈 Personajes por idioma:", stats);
    }
    catch (error) {
        console.error("❌ Error en la migración:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("🔌 Desconectado de MongoDB");
        process.exit(0);
    }
}
// Ejecutar migración
migrateCharacters();
