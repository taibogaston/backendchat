"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_model_1 = require("../models/message.model");
const chat_model_1 = require("../models/chat.model");
const ai_service_1 = require("../services/ai.service");
const character_service_1 = require("../services/character.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Listar mensajes de un chat (solo si pertenece al usuario autenticado)
router.get("/:chatId", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { chatId } = req.params;
        // Verificar que el chat pertenece al usuario
        const chat = await chat_model_1.Chat.findOne({ _id: chatId, userId: req.user._id });
        if (!chat) {
            return res.status(404).json({ error: "Chat no encontrado" });
        }
        const messages = await message_model_1.Message.find({ chatId }).sort({ createdAt: 1 });
        res.json(messages);
    }
    catch (err) {
        res.status(500).json({ error: "Error obteniendo mensajes" });
    }
});
// Endpoint de prueba para simular detección de nuevo personaje
router.post("/test-new-character/:chatId", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { chatId } = req.params;
        // Obtener información del chat para el contexto (verificar que pertenece al usuario)
        const chat = await chat_model_1.Chat.findOne({ _id: chatId, userId: req.user._id });
        if (!chat) {
            return res.status(404).json({ error: "Chat no encontrado" });
        }
        // Simula una respuesta de IA con nuevo personaje
        const mockAiResponse = `¡Hola! Te presento a Emily de Estados Unidos 🇺🇸. Es profesora de inglés y le encanta enseñar mediante conversaciones sobre viajes y cultura. ¡Hablemos con ella ahora!

NUEVO_AMIGO: {"nombre":"Emily","nacionalidad":"Estados Unidos","genero":"F","idioma_objetivo":"inglés"}`;
        console.log("🧪 Probando detección con respuesta simulada:", mockAiResponse);
        console.log("🧪 Personaje actual del chat:", chat.partner);
        // Detecta si la IA presentó un nuevo amigo (soporta multilínea)
        const match = mockAiResponse.match(/NUEVO_AMIGO:\s*(\{[\s\S]*?\})/);
        console.log("🔍 Match encontrado:", match);
        let newChat = null;
        if (match) {
            try {
                // Extrae los datos del nuevo amigo
                console.log("📝 JSON extraído:", match[1]);
                const partner = JSON.parse(match[1]);
                console.log("👤 Partner parseado:", partner);
                // Valida que el partner tenga los campos requeridos
                if (!partner.nombre || !partner.nacionalidad || !partner.genero || !partner.idioma_objetivo) {
                    console.error("❌ Datos incompletos:", partner);
                    throw new Error("Datos del nuevo amigo incompletos");
                }
                // Busca el chat original para obtener el userId
                const oldChat = await chat_model_1.Chat.findById(chatId);
                console.log("💬 Chat original encontrado:", oldChat ? "Sí" : "No");
                if (oldChat) {
                    console.log("🆕 Creando nuevo chat...");
                    newChat = await chat_model_1.Chat.create({
                        userId: oldChat.userId,
                        partner,
                        activo: true
                    });
                    console.log("✅ Nuevo chat creado:", newChat._id);
                }
                else {
                    throw new Error("Chat original no encontrado");
                }
            }
            catch (error) {
                console.error("❌ Error creando nuevo chat:", error);
            }
        }
        const response = {
            success: true,
            newChat: newChat ? {
                id: newChat._id,
                partner: newChat.partner,
                activo: newChat.activo,
                createdAt: newChat.createdAt
            } : null
        };
        console.log("📤 Respuesta de prueba:", JSON.stringify(response, null, 2));
        res.json(response);
    }
    catch (err) {
        console.error("❌ Error en prueba:", err);
        res.status(500).json({ error: "Error en prueba" });
    }
});
router.post("/:chatId", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { sender, content } = req.body;
        const { chatId } = req.params;
        const userMsg = await message_model_1.Message.create({
            chatId,
            sender,
            content
        });
        let aiMsg = null;
        let newChat = null;
        let newChatId = null;
        if (sender === "user") {
            // Obtener información del chat para saber qué personaje es (verificar que pertenece al usuario)
            const chat = await chat_model_1.Chat.findOne({ _id: chatId, userId: req.user._id });
            if (!chat) {
                return res.status(404).json({ error: "Chat no encontrado" });
            }
            const history = await message_model_1.Message.find({ chatId }).sort({ createdAt: 1 });
            const messages = history.map((m) => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.content
            }));
            // Obtener el personaje completo de la base de datos
            const character = await character_service_1.CharacterService.getCharacterByName(chat.partner.nombre);
            // Pasar información del personaje al servicio de IA
            const aiResponse = await (0, ai_service_1.chatWithAI)(messages, chat.partner);
            // Validar consistencia del personaje si existe
            if (character) {
                const validation = character_service_1.CharacterService.validateCharacterConsistency(character, aiResponse);
            }
            // Detecta si la IA presentó un nuevo amigo - DESHABILITADO TEMPORALMENTE
            // let match = aiResponse.match(/NUEVO_AMIGO:\s*(\{[\s\S]*?\})/);
            // console.log("🔍 Match encontrado:", match);
            // console.log("🔍 Texto completo de búsqueda:", aiResponse);
            // Búsqueda alternativa si no encuentra el patrón exacto
            // if (!match) {
            //     console.log("🔍 Intentando búsqueda alternativa...");
            //     match = aiResponse.match(/NUEVO_AMIGO[:\s]*(\{[\s\S]*?\})/);
            //     console.log("🔍 Match alternativo:", match);
            // }
            if (false) {
                try {
                    // Extrae los datos del nuevo amigo
                    console.log("📝 JSON extraído:", match[1]);
                    const partner = JSON.parse(match[1]);
                    console.log("👤 Partner parseado:", partner);
                    // Valida que el partner tenga los campos requeridos
                    if (!partner.nombre || !partner.nacionalidad || !partner.genero || !partner.idioma_objetivo) {
                        console.error("❌ Datos incompletos:", partner);
                        throw new Error("Datos del nuevo amigo incompletos");
                    }
                    // Verificar si ya existe un chat con este personaje
                    console.log("🔍 Verificando si ya existe chat con", partner.nombre);
                    const existingChat = await chat_model_1.Chat.findOne({
                        userId: req.user._id,
                        "partner.nombre": partner.nombre,
                        "partner.nacionalidad": partner.nacionalidad,
                        activo: true
                    });
                    if (existingChat) {
                        console.log("📱 Chat existente encontrado:", existingChat._id);
                        newChat = existingChat;
                        newChatId = existingChat._id;
                    }
                    else {
                        // Usar el userId del usuario autenticado
                        console.log("🆕 Creando nuevo chat...");
                        newChat = await chat_model_1.Chat.create({
                            userId: req.user._id,
                            partner,
                            activo: true
                        });
                        newChatId = newChat._id;
                        console.log("✅ Nuevo chat creado:", newChat._id);
                    }
                    // Limpia el mensaje para el usuario (sin la línea NUEVO_AMIGO)
                    const cleanResponse = aiResponse.replace(/NUEVO_AMIGO:[\s\S]*$/, "").trim();
                    aiMsg = await message_model_1.Message.create({
                        chatId,
                        sender: "ia",
                        content: cleanResponse
                    });
                }
                catch (error) {
                    console.error("❌ Error creando nuevo chat:", error);
                    // Si hay error, guarda el mensaje normal sin crear nuevo chat
                    aiMsg = await message_model_1.Message.create({
                        chatId,
                        sender: "ia",
                        content: aiResponse
                    });
                }
            }
            else {
                aiMsg = await message_model_1.Message.create({
                    chatId,
                    sender: "ia",
                    content: aiResponse
                });
            }
        }
        // Estructura de respuesta mejorada
        const response = {
            userMsg,
            aiMsg,
            newChat: newChat ? {
                id: newChat._id,
                partner: newChat.partner,
                activo: newChat.activo,
                createdAt: newChat.createdAt
            } : null
        };
        console.log("📤 Respuesta final:", JSON.stringify(response, null, 2));
        res.json(response);
    }
    catch (err) {
        res.status(500).json({ error: "Error enviando mensaje" });
    }
});
exports.default = router;
