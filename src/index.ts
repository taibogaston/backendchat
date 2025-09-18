import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import userRoutes from "./routes/user.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import authRoutes from "./routes/auth.routes";
import onboardingRoutes from "./routes/onboarding.routes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ 
    origin: [
        /^http:\/\/localhost:\d+$/,  // localhost para desarrollo
        "https://frontendchatweb.onrender.com"  // dominio de producción
    ], 
    credentials: true  // Habilitar cookies y headers de autenticación
}));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
