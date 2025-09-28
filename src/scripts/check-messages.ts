import mongoose from "mongoose";
import { Message } from "../models/message.model";
import { Chat } from "../models/chat.model";

const checkMessages = async () => {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("✅ MongoDB conectado");

        // Obtener todos los chats
        const chats = await Chat.find({}).sort({ createdAt: -1 });
        console.log(`\n📊 Total de chats: ${chats.length}`);
        
        for (const chat of chats) {
            console.log(`\n💬 Chat ID: ${chat._id}`);
            console.log(`   Usuario: ${chat.userId}`);
            console.log(`   Personaje: ${chat.partner.nombre} (${chat.partner.nacionalidad})`);
            console.log(`   Activo: ${chat.activo}`);
            console.log(`   Creado: ${chat.createdAt}`);
            
            // Obtener mensajes de este chat
            const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
            console.log(`   📨 Mensajes: ${messages.length}`);
            
            if (messages.length > 0) {
                console.log("   📝 Últimos mensajes:");
                messages.slice(-3).forEach((msg, index) => {
                    const time = new Date((msg as any).createdAt).toLocaleTimeString();
                    console.log(`      ${index + 1}. [${msg.sender}] ${time}: ${msg.content.substring(0, 50)}...`);
                });
            } else {
                console.log("   ⚠️  No hay mensajes en este chat");
            }
        }

        // Obtener todos los mensajes
        const allMessages = await Message.find({}).sort({ createdAt: -1 });
        console.log(`\n📨 Total de mensajes en la base de datos: ${allMessages.length}`);
        
        if (allMessages.length > 0) {
            console.log("\n📝 Últimos 5 mensajes:");
            allMessages.slice(0, 5).forEach((msg, index) => {
                const time = new Date((msg as any).createdAt).toLocaleTimeString();
                console.log(`   ${index + 1}. [${msg.sender}] ${time}: ${msg.content.substring(0, 100)}...`);
            });
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Desconectado de MongoDB");
    }
};

checkMessages();
