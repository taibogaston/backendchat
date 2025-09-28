import mongoose from "mongoose";
import { CharacterService } from "../services/character.service";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("✅ MongoDB conectado");
        
        // Inicializar personajes en la base de datos
        await CharacterService.seedCharacters();
    } catch (err) {
        console.error("❌ Error conectando MongoDB", err);
        process.exit(1);
    }
};
