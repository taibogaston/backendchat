"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const ai_service_1 = require("../services/ai.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Inicializar personajes en la base de datos (solo para desarrollo)
router.post("/seed", async (req, res) => {
    try {
        await services_1.CharacterService.seedCharacters();
        res.json({ message: "Personajes inicializados exitosamente" });
    }
    catch (error) {
        console.error("Error inicializando personajes:", error);
        res.status(500).json({ error: "Error inicializando personajes" });
    }
});
// Obtener todos los personajes
router.get("/", async (req, res) => {
    try {
        const characters = await services_1.CharacterService.getAllCharacters();
        res.json(characters);
    }
    catch (error) {
        console.error("Error obteniendo personajes:", error);
        res.status(500).json({ error: "Error obteniendo personajes" });
    }
});
// Obtener personaje por ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const character = await services_1.CharacterService.getCharacterById(id);
        if (!character) {
            return res.status(404).json({ error: "Personaje no encontrado" });
        }
        res.json(character);
    }
    catch (error) {
        console.error("Error obteniendo personaje:", error);
        res.status(500).json({ error: "Error obteniendo personaje" });
    }
});
// Obtener personajes por idioma
router.get("/language/:idioma", async (req, res) => {
    try {
        const { idioma } = req.params;
        const characters = await services_1.CharacterService.getCharactersByLanguage(idioma);
        res.json(characters);
    }
    catch (error) {
        console.error("Error obteniendo personajes por idioma:", error);
        res.status(500).json({ error: "Error obteniendo personajes por idioma" });
    }
});
// Obtener personajes por nacionalidad
router.get("/nationality/:nacionalidad", async (req, res) => {
    try {
        const { nacionalidad } = req.params;
        const characters = await services_1.CharacterService.getCharactersByNationality(nacionalidad);
        res.json(characters);
    }
    catch (error) {
        console.error("Error obteniendo personajes por nacionalidad:", error);
        res.status(500).json({ error: "Error obteniendo personajes por nacionalidad" });
    }
});
// Buscar personajes con criterios específicos
router.post("/search", async (req, res) => {
    try {
        const criteria = req.body;
        const characters = await services_1.CharacterService.searchCharacters(criteria);
        res.json(characters);
    }
    catch (error) {
        console.error("Error buscando personajes:", error);
        res.status(500).json({ error: "Error buscando personajes" });
    }
});
// Obtener personajes recomendados para un usuario
router.get("/recommended/:userId", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { idioma_objetivo, nacionalidad, genero } = req.query;
        const characters = await (0, ai_service_1.getRecommendedCharacters)(idioma_objetivo, nacionalidad, genero);
        res.json(characters);
    }
    catch (error) {
        console.error("Error obteniendo personajes recomendados:", error);
        res.status(500).json({ error: "Error obteniendo personajes recomendados" });
    }
});
// Crear un nuevo chat con un personaje específico
router.post("/:characterId/chat", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { characterId } = req.params;
        const userId = req.user._id;
        const result = await (0, ai_service_1.createChatWithCharacter)(userId, characterId);
        if (!result) {
            return res.status(404).json({ error: "No se pudo crear el chat con el personaje" });
        }
        res.json(result);
    }
    catch (error) {
        console.error("Error creando chat con personaje:", error);
        res.status(500).json({ error: "Error creando chat con personaje" });
    }
});
// Obtener un personaje aleatorio por idioma
router.get("/random/language/:idioma", async (req, res) => {
    try {
        const { idioma } = req.params;
        const character = await services_1.CharacterService.getRandomCharacterByLanguage(idioma);
        if (!character) {
            return res.status(404).json({ error: "No se encontraron personajes para ese idioma" });
        }
        res.json(character);
    }
    catch (error) {
        console.error("Error obteniendo personaje aleatorio:", error);
        res.status(500).json({ error: "Error obteniendo personaje aleatorio" });
    }
});
// Validar consistencia de un mensaje con un personaje
router.post("/:characterId/validate", async (req, res) => {
    try {
        const { characterId } = req.params;
        const { message } = req.body;
        const character = await services_1.CharacterService.getCharacterById(characterId);
        if (!character) {
            return res.status(404).json({ error: "Personaje no encontrado" });
        }
        const validation = services_1.CharacterService.validateCharacterConsistency(character, message);
        res.json({
            isValid: validation.isValid,
            violations: validation.violations,
            character: {
                nombre: character.nombre,
                nacionalidad: character.nacionalidad,
                idioma_objetivo: character.idioma_objetivo
            }
        });
    }
    catch (error) {
        console.error("Error validando consistencia:", error);
        res.status(500).json({ error: "Error validando consistencia" });
    }
});
// Obtener estadísticas de personajes
router.get("/stats/overview", async (req, res) => {
    try {
        const characters = await services_1.CharacterService.getAllCharacters();
        const stats = {
            total: characters.length,
            por_idioma: {},
            por_nacionalidad: {},
            por_genero: { M: 0, F: 0 },
            por_nivel_enseñanza: {}
        };
        characters.forEach(char => {
            // Por idioma
            stats.por_idioma[char.idioma_objetivo] = (stats.por_idioma[char.idioma_objetivo] || 0) + 1;
            // Por nacionalidad
            stats.por_nacionalidad[char.nacionalidad] = (stats.por_nacionalidad[char.nacionalidad] || 0) + 1;
            // Por género
            stats.por_genero[char.genero]++;
            // Por nivel de enseñanza
            const nivel = char.restricciones.nivel_enseñanza;
            stats.por_nivel_enseñanza[nivel] = (stats.por_nivel_enseñanza[nivel] || 0) + 1;
        });
        res.json(stats);
    }
    catch (error) {
        console.error("Error obteniendo estadísticas:", error);
        res.status(500).json({ error: "Error obteniendo estadísticas" });
    }
});
exports.default = router;
