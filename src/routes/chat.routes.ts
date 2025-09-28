import { Router } from "express";
import { Chat } from "../models/chat.model";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Obtener todos los chats del usuario autenticado (solo activos)
router.get("/", authenticateToken, async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user._id, activo: true }).sort({ createdAt: -1 });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo chats" });
    }
});

// Obtener un chat específico por ID (solo si pertenece al usuario autenticado)
router.get("/:chatId", authenticateToken, async (req, res) => {
    try {
        const chat = await Chat.findOne({ 
            _id: req.params.chatId, 
            userId: req.user._id 
        });
        if (!chat) {
            return res.status(404).json({ error: "Chat no encontrado" });
        }
        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo chat" });
    }
});

// Crear un nuevo chat con un personaje específico
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { partner } = req.body;
        
        // Validar datos requeridos
        if (!partner) {
            return res.status(400).json({ error: "partner es requerido" });
        }
        
        if (!partner.nombre || !partner.nacionalidad || !partner.genero || !partner.idioma_objetivo) {
            return res.status(400).json({ error: "Datos del partner incompletos" });
        }
        
        const newChat = await Chat.create({
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
    } catch (err) {
        res.status(500).json({ error: "Error creando chat" });
    }
});

// Desactivar un chat (solo si pertenece al usuario autenticado)
router.patch("/:chatId/deactivate", authenticateToken, async (req, res) => {
    try {
        const chat = await Chat.findOneAndUpdate(
            { _id: req.params.chatId, userId: req.user._id },
            { activo: false },
            { new: true }
        );
        
        if (!chat) {
            return res.status(404).json({ error: "Chat no encontrado" });
        }
        
        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: "Error desactivando chat" });
    }
});

export default router;
