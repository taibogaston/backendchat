"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const character_service_1 = require("./services/character.service");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const onboarding_routes_1 = __importDefault(require("./routes/onboarding.routes"));
const character_routes_1 = __importDefault(require("./routes/character.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Configuración de CORS más robusta
const allowedOrigins = [
    /^http:\/\/localhost:\d+$/, // localhost para desarrollo
    "https://frontendchatweb.onrender.com", // dominio de producción
    process.env.FRONTEND_URL || "http://localhost:3000" // URL del frontend desde env
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permitir requests sin origin (mobile apps, postman, etc.)
        if (!origin)
            return callback(null, true);
        // Verificar si el origin está en la lista permitida
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                return origin === allowedOrigin;
            }
            else if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return false;
        });
        if (isAllowed) {
            callback(null, true);
        }
        else {
            console.log('🚫 CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Habilitar cookies y headers de autenticación
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
        await (0, db_1.connectDB)();
        // Sembrar personajes si la base de datos está vacía
        await character_service_1.CharacterService.seedCharacters();
        console.log("✅ Base de datos inicializada correctamente");
    }
    catch (error) {
        console.error("❌ Error inicializando base de datos:", error);
        process.exit(1);
    }
}
// Rutas con prefijo /api/
app.use("/api/auth", auth_routes_1.default);
app.use("/api/onboarding", onboarding_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/chats", chat_routes_1.default);
app.use("/api/messages", message_routes_1.default);
app.use("/api/characters", character_routes_1.default);
const PORT = process.env.PORT || 4000;
// Inicializar base de datos y luego iniciar servidor
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
});
