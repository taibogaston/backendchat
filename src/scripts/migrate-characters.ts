import mongoose from "mongoose";
import dotenv from "dotenv";
import { CharacterService } from "../services/character.service";

dotenv.config();

async function migrateCharacters() {
    try {
        console.log("🔄 Iniciando migración de personajes...");
        
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("✅ Conectado a MongoDB");
        
        // Sembrar personajes
        await CharacterService.seedCharacters();
        
        console.log("✅ Migración completada exitosamente");
        
        // Obtener estadísticas
        const characters = await CharacterService.getAllCharacters();
        console.log(`📊 Total de personajes: ${characters.length}`);
        
        // Mostrar personajes por idioma
        const stats = characters.reduce((acc, char) => {
            acc[char.idioma_objetivo] = (acc[char.idioma_objetivo] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        console.log("📈 Personajes por idioma:", stats);
        
    } catch (error) {
        console.error("❌ Error en la migración:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Desconectado de MongoDB");
        process.exit(0);
    }
}

// Ejecutar migración
migrateCharacters();
