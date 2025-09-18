"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
// Middleware de autenticación
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            return res.status(401).json({ error: 'Token de acceso requerido' });
        }
        // Verificar token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Buscar usuario
        const user = await user_model_1.User.findById(decoded.userId).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }
        // Verificar que el email esté verificado
        if (!user.emailVerified) {
            return res.status(401).json({ error: 'Email no verificado' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(403).json({ error: 'Token inválido' });
    }
};
exports.authenticateToken = authenticateToken;
// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await user_model_1.User.findById(decoded.userId).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
            if (user && user.emailVerified) {
                req.user = user;
            }
        }
        next();
    }
    catch (error) {
        // Si hay error con el token, continuar sin usuario autenticado
        next();
    }
};
exports.optionalAuth = optionalAuth;
