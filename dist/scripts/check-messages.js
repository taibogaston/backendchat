"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const message_model_1 = require("../models/message.model");
const chat_model_1 = require("../models/chat.model");
const checkMessages = async () => {
    try {
        // Conectar a la base de datos
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");
        // Obtener todos los chats
        const chats = await chat_model_1.Chat.find({}).sort({ createdAt: -1 });
        console.log(`\n📊 Total de chats: ${chats.length}`);
        for (const chat of chats) {
            console.log(`\n💬 Chat ID: ${chat._id}`);
            console.log(`   Usuario: ${chat.userId}`);
            console.log(`   Personaje: ${chat.partner.nombre} (${chat.partner.nacionalidad})`);
            console.log(`   Activo: ${chat.activo}`);
            console.log(`   Creado: ${chat.createdAt}`);
            // Obtener mensajes de este chat
            const messages = await message_model_1.Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
            console.log(`   📨 Mensajes: ${messages.length}`);
            if (messages.length > 0) {
                console.log("   📝 Últimos mensajes:");
                messages.slice(-3).forEach((msg, index) => {
                    const time = new Date(msg.createdAt).toLocaleTimeString();
                    console.log(`      ${index + 1}. [${msg.sender}] ${time}: ${msg.content.substring(0, 50)}...`);
                });
            }
            else {
                console.log("   ⚠️  No hay mensajes en este chat");
            }
        }
        // Obtener todos los mensajes
        const allMessages = await message_model_1.Message.find({}).sort({ createdAt: -1 });
        console.log(`\n📨 Total de mensajes en la base de datos: ${allMessages.length}`);
        if (allMessages.length > 0) {
            console.log("\n📝 Últimos 5 mensajes:");
            allMessages.slice(0, 5).forEach((msg, index) => {
                const time = new Date(msg.createdAt).toLocaleTimeString();
                console.log(`   ${index + 1}. [${msg.sender}] ${time}: ${msg.content.substring(0, 100)}...`);
            });
        }
    }
    catch (error) {
        console.error("❌ Error:", error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log("\n🔌 Desconectado de MongoDB");
    }
};
checkMessages();
