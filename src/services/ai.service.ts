import axios from "axios";
import { ICharacter } from "../models/character.model";
import { CharacterService } from "./character.service";

type Partner = {
    nombre: string;
    nacionalidad: string;
    genero: "M" | "F";
    idioma_objetivo: string;
};

export async function chatWithAI(
    messages: { role: string; content: string }[],
    partner?: Partner
) {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) throw new Error("OPENAI_API_KEY no definido en .env");

    let systemPrompt = "";
    
    if (partner) {
        // Buscar el personaje completo en la base de datos
        const character = await CharacterService.getCharacterByName(partner.nombre);
        
        if (character) {
            // Usar el prompt específico del personaje
            systemPrompt = CharacterService.generateCharacterPrompt(character);
        } else {
            // Fallback al sistema anterior si no se encuentra el personaje
            systemPrompt = `Eres ${partner.nombre} de ${partner.nacionalidad}. 
            - Género: ${partner.genero}
            - Idioma principal: ${partner.idioma_objetivo}
            - Mantén tu personalidad consistente en todas las respuestas.
            - Solo habla en ${partner.idioma_objetivo}.
            - Responde como si fueras realmente ${partner.nombre}.`;
        }
    } else {
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
        const res = await axios.post("https://api.openai.com/v1/chat/completions", body, {
            headers: {
                Authorization: `Bearer ${OPENAI_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const response = res.data.choices?.[0]?.message?.content || "";
        
        // Validar consistencia del personaje si existe
        if (partner) {
            const character = await CharacterService.getCharacterByName(partner.nombre);
            if (character) {
                const validation = CharacterService.validateCharacterConsistency(character, response);
                if (!validation.isValid) {
                    console.warn("⚠️ Inconsistencias detectadas en la respuesta:", validation.violations);
                }
            }
        }

        return response;
    } catch (error) {
        console.error("❌ Error en chatWithAI:", error);
        throw error;
    }
}

/**
 * Función para crear un nuevo chat con un personaje específico
 * Solo crea el chat si no existe uno previo con el mismo personaje
 */
export async function createChatWithCharacter(
    userId: string,
    characterId: string
): Promise<{ chatId: string; character: ICharacter; isNew: boolean } | null> {
    try {
        const character = await CharacterService.getCharacterById(characterId);
        if (!character) {
            throw new Error("Personaje no encontrado");
        }

        // Verificar si ya existe un chat con este personaje (verificación más robusta)
        const { Chat } = await import("../models/chat.model");
        const existingChat = await Chat.findOne({
            userId,
            "partner.nombre": character.nombre,
            "partner.nacionalidad": character.nacionalidad,
            "partner.idioma_objetivo": character.idioma_objetivo,
            activo: true
        });

        if (existingChat) {
            return {
                chatId: (existingChat._id as any).toString(),
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
            chatId: (newChat._id as any).toString(),
            character,
            isNew: true
        };
    } catch (error) {
        return null;
    }
}

/**
 * Función para obtener personajes recomendados basados en preferencias del usuario
 */
export async function getRecommendedCharacters(
    idioma_objetivo?: string,
    nacionalidad?: string,
    genero?: "M" | "F"
): Promise<ICharacter[]> {
    const criteria: any = {};
    
    if (idioma_objetivo) criteria.idioma = idioma_objetivo;
    if (nacionalidad) criteria.nacionalidad = nacionalidad;
    if (genero) criteria.genero = genero;
    
    return await CharacterService.searchCharacters(criteria);
}
