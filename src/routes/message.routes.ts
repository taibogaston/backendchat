import { Router } from "express";
import { Message } from "../models/message.model";
import {Chat} from "../models/chat.model";
import {chatWithAI} from "../services/ai.service";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Listar mensajes de un chat (solo si pertenece al usuario autenticado)
router.get("/:chatId", authenticateToken, async (req, res) => {
    try {
        const { chatId } = req.params;
        
        // Verificar que el chat pertenece al usuario
        const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
        if (!chat) {
            return res.status(404).json({ error: "Chat no encontrado" });
        }
        
        const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo mensajes" });
    }
});

// Endpoint de prueba para simular detección de nuevo personaje
router.post("/test-new-character/:chatId", authenticateToken, async (req, res) => {
    try {
        const { chatId } = req.params;
        
        // Obtener información del chat para el contexto (verificar que pertenece al usuario)
        const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
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
                const oldChat = await Chat.findById(chatId);
                console.log("💬 Chat original encontrado:", oldChat ? "Sí" : "No");
                
                if (oldChat) {
                    console.log("🆕 Creando nuevo chat...");
                    newChat = await Chat.create({
                        userId: oldChat.userId,
                        partner,
                        activo: true
                    });
                    console.log("✅ Nuevo chat creado:", newChat._id);
                } else {
                    throw new Error("Chat original no encontrado");
                }
            } catch (error) {
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
    } catch (err) {
        console.error("❌ Error en prueba:", err);
        res.status(500).json({ error: "Error en prueba" });
    }
});

router.post("/:chatId", authenticateToken, async (req, res) => {
    try {
        const { sender, content } = req.body;
        const { chatId } = req.params;
        
        console.log("📨 Mensaje recibido:");
        console.log("   ChatId:", chatId);
        console.log("   Sender:", sender);
        console.log("   Content:", content);

        const userMsg = await Message.create({
            chatId,
            sender,
            content
        });

        let aiMsg = null;
        let newChat = null;
        let newChatId = null;

        if (sender === "user") {
            // Obtener información del chat para saber qué personaje es (verificar que pertenece al usuario)
            const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
            if (!chat) {
                return res.status(404).json({ error: "Chat no encontrado" });
            }

            const history = await Message.find({ chatId }).sort({ createdAt: 1 });
            const messages = history.map((m) => ({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.content
            }));

            // Pasar información del personaje al servicio de IA
            console.log("👤 Personaje del chat:", chat.partner);
            const aiResponse = await chatWithAI(messages, chat.partner as any);
            console.log("🤖 Respuesta de la IA:", aiResponse);

            // Detecta si la IA presentó un nuevo amigo - regex flexible y multilínea
            let match = aiResponse.match(/NUEVO_AMIGO:\s*(\{[\s\S]*?\})/);
            console.log("🔍 Match encontrado:", match);
            console.log("🔍 Texto completo de búsqueda:", aiResponse);
            
            // Búsqueda alternativa si no encuentra el patrón exacto
            if (!match) {
                console.log("🔍 Intentando búsqueda alternativa...");
                match = aiResponse.match(/NUEVO_AMIGO[:\s]*(\{[\s\S]*?\})/);
                console.log("🔍 Match alternativo:", match);
            }
            
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
                    
                    // Usar el userId del usuario autenticado
                    console.log("🆕 Creando nuevo chat...");
                    newChat = await Chat.create({
                        userId: req.user._id,
                        partner,
                        activo: true
                    });
                    newChatId = newChat._id;
                    console.log("✅ Nuevo chat creado:", newChat._id);
                    
                    // Limpia el mensaje para el usuario (sin la línea NUEVO_AMIGO)
                    const cleanResponse = aiResponse.replace(/NUEVO_AMIGO:[\s\S]*$/, "").trim();
                    aiMsg = await Message.create({
                        chatId,
                        sender: "ia",
                        content: cleanResponse
                    });
                } catch (error) {
                    console.error("❌ Error creando nuevo chat:", error);
                    // Si hay error, guarda el mensaje normal sin crear nuevo chat
                    aiMsg = await Message.create({
                        chatId,
                        sender: "ia",
                        content: aiResponse
                    });
                }
            } else {
                aiMsg = await Message.create({
                    chatId,
                    sender: "ia",
                    content: aiResponse
                });
            }
        }

        // Estructura de respuesta mejorada
        const response: any = {
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
    } catch (err) {
        res.status(500).json({ error: "Error enviando mensaje" });
    }
});

export default router;
