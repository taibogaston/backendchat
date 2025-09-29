import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { CharacterService } from "./services/character.service";
import userRoutes from "./routes/user.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import authRoutes from "./routes/auth.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import characterRoutes from "./routes/character.routes";

dotenv.config();

const app = express();
app.use(express.json());
// Configuración de CORS más robusta
const allowedOrigins = [
    /^http:\/\/localhost:\d+$/,  // localhost para desarrollo
    "https://frontendchatweb.onrender.com",  // dominio de producción
    process.env.FRONTEND_URL || "http://localhost:3000"  // URL del frontend desde env
];

app.use(cors({ 
    origin: (origin, callback) => {
        // Permitir requests sin origin (mobile apps, postman, etc.)
        if (!origin) return callback(null, true);
        
        // Verificar si el origin está en la lista permitida
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                return origin === allowedOrigin;
            } else if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return false;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('🚫 CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,  // Habilitar cookies y headers de autenticación
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));

// Middleware adicional para manejar preflight requests
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});

// Función para inicializar la base de datos
async function initializeDatabase() {
    try {
        console.log("🔄 Inicializando base de datos...");
        
        // Conectar a la base de datos
        await connectDB();
        
        // Sembrar personajes si la base de datos está vacía
        await CharacterService.seedCharacters();
        
        console.log("✅ Base de datos inicializada correctamente");
    } catch (error) {
        console.error("❌ Error inicializando base de datos:", error);
        process.exit(1);
    }
}

// Rutas con prefijo /api/
app.use("/api/auth", authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/characters", characterRoutes);

const PORT = process.env.PORT || 4000;

// Inicializar base de datos y luego iniciar servidor
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
});
