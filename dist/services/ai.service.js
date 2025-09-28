"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = chatWithAI;
exports.createChatWithCharacter = createChatWithCharacter;
exports.getRecommendedCharacters = getRecommendedCharacters;
const axios_1 = __importDefault(require("axios"));
const character_service_1 = require("./character.service");
async function chatWithAI(messages, partner) {
    var _a, _b, _c;
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY)
        throw new Error("OPENAI_API_KEY no definido en .env");
    let systemPrompt = "";
    if (partner) {
        // Buscar el personaje completo en la base de datos
        const character = await character_service_1.CharacterService.getCharacterByName(partner.nombre);
        if (character) {
            // Usar el prompt específico del personaje
            systemPrompt = character_service_1.CharacterService.generateCharacterPrompt(character);
        }
        else {
            // Fallback al sistema anterior si no se encuentra el personaje
            systemPrompt = `Eres ${partner.nombre} de ${partner.nacionalidad}. 
            - Género: ${partner.genero}
            - Idioma principal: ${partner.idioma_objetivo}
            - Mantén tu personalidad consistente en todas las respuestas.
            - Solo habla en ${partner.idioma_objetivo}.
            - Responde como si fueras realmente ${partner.nombre}.`;
        }
    }
    else {
        // Prompt genérico para cuando no hay personaje específico
        systemPrompt = `Eres un asistente de aprendizaje de idiomas. Ayuda al usuario a practicar idiomas de manera natural y conversacional.`;
    }
    const body = {
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            ...messages
        ],
        max_tokens: 400,
        temperature: 0.8 // Aumentar creatividad para personalidades más vivas
    };
    try {
        const res = await axios_1.default.post("https://api.openai.com/v1/chat/completions", body, {
            headers: {
                Authorization: `Bearer ${OPENAI_KEY}`,
                "Content-Type": "application/json"
            }
        });
        const response = ((_c = (_b = (_a = res.data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || "";
        // Validar consistencia del personaje si existe
        if (partner) {
            const character = await character_service_1.CharacterService.getCharacterByName(partner.nombre);
            if (character) {
                const validation = character_service_1.CharacterService.validateCharacterConsistency(character, response);
                if (!validation.isValid) {
                    console.warn("⚠️ Inconsistencias detectadas en la respuesta:", validation.violations);
                }
            }
        }
        return response;
    }
    catch (error) {
        console.error("❌ Error en chatWithAI:", error);
        throw error;
    }
}
/**
 * Función para crear un nuevo chat con un personaje específico
 * Solo crea el chat si no existe uno previo con el mismo personaje
 */
async function createChatWithCharacter(userId, characterId) {
    try {
        const character = await character_service_1.CharacterService.getCharacterById(characterId);
        if (!character) {
            throw new Error("Personaje no encontrado");
        }
        // Verificar si ya existe un chat con este personaje (verificación más robusta)
        const { Chat } = await Promise.resolve().then(() => __importStar(require("../models/chat.model")));
        const existingChat = await Chat.findOne({
            userId,
            "partner.nombre": character.nombre,
            "partner.nacionalidad": character.nacionalidad,
            "partner.idioma_objetivo": character.idioma_objetivo,
            activo: true
        });
        if (existingChat) {
            return {
                chatId: existingChat._id.toString(),
                character,
                isNew: false
            };
        }
        // Crear nuevo chat solo si no existe
        const newChat = await Chat.create({
            userId,
            partner: {
                nombre: character.nombre,
                nacionalidad: character.nacionalidad,
                genero: character.genero,
                idioma_objetivo: character.idioma_objetivo
            },
            activo: true
        });
        return {
            chatId: newChat._id.toString(),
            character,
            isNew: true
        };
    }
    catch (error) {
        return null;
    }
}
/**
 * Función para obtener personajes recomendados basados en preferencias del usuario
 */
async function getRecommendedCharacters(idioma_objetivo, nacionalidad, genero) {
    const criteria = {};
    if (idioma_objetivo)
        criteria.idioma = idioma_objetivo;
    if (nacionalidad)
        criteria.nacionalidad = nacionalidad;
    if (genero)
        criteria.genero = genero;
    return await character_service_1.CharacterService.searchCharacters(criteria);
}
