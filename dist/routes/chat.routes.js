"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_model_1 = require("../models/chat.model");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Obtener todos los chats del usuario autenticado (solo activos)
router.get("/", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const chats = await chat_model_1.Chat.find({ userId: req.user._id, activo: true }).sort({ createdAt: -1 });
        res.json(chats);
    }
    catch (err) {
        res.status(500).json({ error: "Error obteniendo chats" });
    }
});
// Obtener un chat específico por ID (solo si pertenece al usuario autenticado)
router.get("/:chatId", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const chat = await chat_model_1.Chat.findOne({
            _id: req.params.chatId,
            userId: req.user._id
        });
        if (!chat) {
            return res.status(404).json({ error: "Chat no encontrado" });
        }
        res.json(chat);
    }
    catch (err) {
        res.status(500).json({ error: "Error obteniendo chat" });
    }
});
// Crear un nuevo chat con un personaje específico
router.post("/", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { partner } = req.body;
        // Validar datos requeridos
        if (!partner) {
            return res.status(400).json({ error: "partner es requerido" });
        }
        if (!partner.nombre || !partner.nacionalidad || !partner.genero || !partner.idioma_objetivo) {
            return res.status(400).json({ error: "Datos del partner incompletos" });
        }
        const newChat = await chat_model_1.Chat.create({
            userId: req.user._id,
            partner,
            activo: true
        });
        res.status(201).json({
            id: newChat._id,
            partner: newChat.partner,
            activo: newChat.activo,
            createdAt: newChat.createdAt
        });
    }
    catch (err) {
        res.status(500).json({ error: "Error creando chat" });
    }
});
// Desactivar un chat (solo si pertenece al usuario autenticado)
router.patch("/:chatId/deactivate", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const chat = await chat_model_1.Chat.findOneAndUpdate({ _id: req.params.chatId, userId: req.user._id }, { activo: false }, { new: true });
        if (!chat) {
            return res.status(404).json({ error: "Chat no encontrado" });
        }
        res.json(chat);
    }
    catch (err) {
        res.status(500).json({ error: "Error desactivando chat" });
    }
});
exports.default = router;
