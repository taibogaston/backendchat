"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const character_service_1 = require("../services/character.service");
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");
        // Inicializar personajes en la base de datos
        await character_service_1.CharacterService.seedCharacters();
    }
    catch (err) {
        console.error("❌ Error conectando MongoDB", err);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
