"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterService = void 0;
const character_model_1 = require("../models/character.model");
const characters_seed_1 = require("../data/characters.seed");
class CharacterService {
    /**
     * Inicializa la base de datos con personajes predefinidos
     */
    static async seedCharacters() {
        try {
            const existingCharacters = await character_model_1.Character.countDocuments();
            if (existingCharacters === 0) {
                console.log("🌱 Sembrando personajes en la base de datos...");
                await character_model_1.Character.insertMany(characters_seed_1.charactersSeed);
                console.log(`✅ ${characters_seed_1.charactersSeed.length} personajes sembrados exitosamente`);
            }
            else {
                console.log(`📊 Ya existen ${existingCharacters} personajes en la base de datos`);
            }
        }
        catch (error) {
            console.error("❌ Error sembrando personajes:", error);
            throw error;
        }
    }
    /**
     * Obtiene todos los personajes activos
     */
    static async getAllCharacters() {
        return await character_model_1.Character.find({ activo: true }).sort({ nombre: 1 });
    }
    /**
     * Obtiene un personaje por ID
     */
    static async getCharacterById(id) {
        return await character_model_1.Character.findById(id);
    }
    /**
     * Obtiene un personaje por nombre
     */
    static async getCharacterByName(nombre) {
        return await character_model_1.Character.findOne({ nombre, activo: true });
    }
    /**
     * Obtiene personajes por idioma objetivo
     */
    static async getCharactersByLanguage(idioma) {
        return await character_model_1.Character.find({
            idioma_objetivo: idioma,
            activo: true
        }).sort({ nombre: 1 });
    }
    /**
     * Obtiene personajes por nacionalidad
     */
    static async getCharactersByNationality(nacionalidad) {
        return await character_model_1.Character.find({
            nacionalidad,
            activo: true
        }).sort({ nombre: 1 });
    }
    /**
     * Genera un prompt específico para un personaje
     */
    static generateCharacterPrompt(character) {
        const { nombre, nacionalidad, genero, idioma_objetivo, personalidad, historia_personal, contexto_cultural, estilo_conversacional, restricciones } = character;
        return `
Eres ${nombre}, ${personalidad.descripcion}

INFORMACIÓN PERSONAL:
- Edad: ${personalidad.edad} años
- Profesión: ${personalidad.profesion}
- Estado civil: ${personalidad.estado_civil}
- Familia: ${personalidad.familia}
- Lugar de nacimiento: ${personalidad.lugar_nacimiento}
- Residencia actual: ${personalidad.residencia_actual}

PERSONALIDAD:
- Rasgos principales: ${personalidad.rasgos.join(", ")}
- Motivaciones: ${personalidad.motivaciones.join(", ")}
- Miedos: ${personalidad.miedos.join(", ")}
- Sueños: ${personalidad.sueños.join(", ")}
- Hobbies: ${personalidad.hobbies.join(", ")}

HISTORIA PERSONAL:
- Infancia: ${historia_personal.infancia}
- Juventud: ${historia_personal.juventud}
- Vida actual: ${historia_personal.vida_actual}
- Experiencias clave: ${historia_personal.experiencias_clave.join("; ")}
- Anécdotas: ${historia_personal.anecdotas.join("; ")}

CONTEXTO CULTURAL:
- Tradiciones: ${contexto_cultural.tradiciones.join(", ")}
- Comida favorita: ${contexto_cultural.comida_favorita.join(", ")}
- Música preferida: ${contexto_cultural.musica_preferida.join(", ")}
- Lugares importantes: ${contexto_cultural.lugares_importantes.join(", ")}
- Festividades: ${contexto_cultural.festividades.join(", ")}
- Costumbres: ${contexto_cultural.costumbres.join(", ")}

ESTILO CONVERSACIONAL:
- Tono: ${estilo_conversacional.tono}
- Expresiones típicas: ${estilo_conversacional.expresiones_tipicas.join(", ")}
- Palabras clave: ${estilo_conversacional.palabras_clave.join(", ")}
- Nivel de formalidad: ${estilo_conversacional.nivel_formalidad}
- Velocidad de habla: ${estilo_conversacional.velocidad_habla}

RESTRICCIONES ESTRICTAS:
- SOLO puedes hablar en: ${restricciones.idiomas_permitidos.join(", ")}
- NUNCA hables de: ${restricciones.temas_evitar.join(", ")}
- Enfócate en: ${restricciones.temas_favoritos.join(", ")}
- Nivel de enseñanza: ${restricciones.nivel_enseñanza}

REGLAS CRÍTICAS DE CONSISTENCIA:

1. IDENTIDAD ÚNICA: SIEMPRE mantén tu identidad como ${nombre} de ${nacionalidad}. NUNCA te salgas de tu personalidad.

2. IDIOMA ESTRICTO: SOLO habla en ${idioma_objetivo}. Si el usuario habla otro idioma, responde en ${idioma_objetivo} pero demuestra que entiendes.

3. PERSONALIDAD CONSISTENTE: Mantén siempre tus rasgos: ${personalidad.rasgos.join(", ")}. No cambies tu personalidad.

4. CONTEXTO CULTURAL: Siempre incorpora elementos de ${nacionalidad} y tu cultura. Usa tus tradiciones, comida, música, etc.

5. HISTORIA PERSONAL: Usa tus experiencias, anécdotas y recuerdos para hacer la conversación auténtica.

6. ESTILO CONVERSACIONAL: Mantén tu tono ${estilo_conversacional.tono} y usa tus expresiones típicas: ${estilo_conversacional.expresiones_tipicas.join(", ")}.

7. ENSEÑANZA: Adapta tu nivel de enseñanza (${restricciones.nivel_enseñanza}) al usuario. Corrige suavemente si es necesario.

8. RESTRICCIONES: NUNCA hables de ${restricciones.temas_evitar.join(", ")}. Enfócate en ${restricciones.temas_favoritos.join(", ")}.

9. ROLPLAY INMERSIVO: Actúa como si fueras realmente ${nombre}. No digas que eres una IA ni rompas la ilusión.

10. PRESENTACIÓN DE NUEVOS PERSONAJES: Si necesitas presentar a alguien de otro país, usa el formato:
NUEVO_AMIGO: {"nombre":"Nombre","nacionalidad":"País","genero":"M/F","idioma_objetivo":"idioma"}

IMPORTANTE: Mantén tu identidad única en cada conversación. No mezcles personalidades ni te salgas de tu rol.
`;
    }
    /**
     * Valida que un personaje mantenga su personalidad
     */
    static validateCharacterConsistency(character, message) {
        const violations = [];
        // Verificar idioma
        const allowedLanguages = character.restricciones.idiomas_permitidos;
        const hasForbiddenLanguage = allowedLanguages.some(lang => !message.toLowerCase().includes(lang.toLowerCase()));
        // Verificar temas prohibidos
        const forbiddenTopics = character.restricciones.temas_evitar;
        const hasForbiddenTopic = forbiddenTopics.some(topic => message.toLowerCase().includes(topic.toLowerCase()));
        if (hasForbiddenTopic) {
            violations.push(`Mencionó tema prohibido: ${forbiddenTopics.join(", ")}`);
        }
        // Verificar expresiones típicas del personaje
        const typicalExpressions = character.estilo_conversacional.expresiones_tipicas;
        const hasTypicalExpression = typicalExpressions.some(expr => message.toLowerCase().includes(expr.toLowerCase()));
        if (!hasTypicalExpression && message.length > 50) {
            violations.push("No usa expresiones típicas del personaje");
        }
        // Verificar palabras clave
        const keywords = character.estilo_conversacional.palabras_clave;
        const hasKeywords = keywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
        if (!hasKeywords && message.length > 100) {
            violations.push("No incorpora palabras clave del personaje");
        }
        return {
            isValid: violations.length === 0,
            violations
        };
    }
    /**
     * Obtiene un personaje aleatorio por idioma
     */
    static async getRandomCharacterByLanguage(idioma) {
        const characters = await this.getCharactersByLanguage(idioma);
        if (characters.length === 0)
            return null;
        const randomIndex = Math.floor(Math.random() * characters.length);
        return characters[randomIndex];
    }
    /**
     * Busca personajes por criterios específicos
     */
    static async searchCharacters(criteria) {
        const query = { activo: true };
        if (criteria.idioma) {
            query.idioma_objetivo = criteria.idioma;
        }
        if (criteria.nacionalidad) {
            query.nacionalidad = criteria.nacionalidad;
        }
        if (criteria.genero) {
            query.genero = criteria.genero;
        }
        if (criteria.nivel_enseñanza) {
            query["restricciones.nivel_enseñanza"] = criteria.nivel_enseñanza;
        }
        if (criteria.edad_min || criteria.edad_max) {
            query["personalidad.edad"] = {};
            if (criteria.edad_min)
                query["personalidad.edad"].$gte = criteria.edad_min;
            if (criteria.edad_max)
                query["personalidad.edad"].$lte = criteria.edad_max;
        }
        return await character_model_1.Character.find(query).sort({ nombre: 1 });
    }
}
exports.CharacterService = CharacterService;
