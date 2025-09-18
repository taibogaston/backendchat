import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/user.model";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email.service";

const router = Router();

// Generar JWT token
const generateToken = (userId: string) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

// Registro con email
router.post("/register", async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Validar datos requeridos
        if (!nombre || !email || !password) {
            return res.status(400).json({ 
                error: "Faltan datos requeridos: nombre, email, password" 
            });
        }

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        // Hash de la contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generar token de verificación
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            nombre,
            email,
            password: hashedPassword,
            verificationToken,
            emailVerified: false,
            onboardingCompleted: false
        });

        // Enviar email de verificación
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({ 
            message: "Usuario registrado. Revisa tu email para verificar tu cuenta.",
            userId: user._id
        });
    } catch (err) {
        console.error("Error registrando usuario:", err);
        res.status(500).json({ error: "Error registrando usuario" });
    }
});

// Verificar email
router.get("/verify/:token", async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ error: "Token de verificación inválido" });
        }

        user.emailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Generar token JWT
        const jwtToken = generateToken((user._id as any).toString());

        res.json({ 
            message: "Email verificado exitosamente",
            token: jwtToken,
            user: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                emailVerified: user.emailVerified,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    } catch (err) {
        console.error("Error verificando email:", err);
        res.status(500).json({ error: "Error verificando email" });
    }
});

// Login con email y contraseña
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                error: "Email y contraseña son requeridos" 
            });
        }

        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password!);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // Verificar si el email está verificado
        if (!user.emailVerified) {
            return res.status(401).json({ 
                error: "Email no verificado. Revisa tu correo para verificar tu cuenta." 
            });
        }

        // Generar token JWT
        const token = generateToken((user._id as any).toString());

        res.json({
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                emailVerified: user.emailVerified,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).json({ error: "Error en login" });
    }
});

// Login con Google (callback)
router.post("/google", async (req, res) => {
    try {
        const { googleId, email, nombre } = req.body;

        if (!googleId || !email || !nombre) {
            return res.status(400).json({ 
                error: "Datos de Google requeridos" 
            });
        }

        // Buscar usuario existente por Google ID o email
        let user = await User.findOne({ 
            $or: [{ googleId }, { email }] 
        });

        if (user) {
            // Si existe pero no tiene Google ID, actualizarlo
            if (!user.googleId) {
                user.googleId = googleId;
                user.emailVerified = true;
                await user.save();
            }
        } else {
            // Crear nuevo usuario
            user = await User.create({
                nombre,
                email,
                googleId,
                emailVerified: true,
                onboardingCompleted: false
            });
        }

        // Generar token JWT
        const token = generateToken((user._id as any).toString());

        res.json({
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                emailVerified: user.emailVerified,
                onboardingCompleted: user.onboardingCompleted
            }
        });
    } catch (err) {
        console.error("Error en login con Google:", err);
        res.status(500).json({ error: "Error en login con Google" });
    }
});

// Solicitar reset de contraseña
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email es requerido" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Por seguridad, no revelar si el email existe o no
            return res.json({ message: "Si el email existe, recibirás un enlace para resetear tu contraseña" });
        }

        // Generar token de reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hora

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        // Enviar email de reset
        await sendPasswordResetEmail(email, resetToken);

        res.json({ message: "Si el email existe, recibirás un enlace para resetear tu contraseña" });
    } catch (err) {
        console.error("Error solicitando reset de contraseña:", err);
        res.status(500).json({ error: "Error solicitando reset de contraseña" });
    }
});

// Reset de contraseña
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ 
                error: "Token y nueva contraseña son requeridos" 
            });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: "Token inválido o expirado" });
        }

        // Hash de la nueva contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (err) {
        console.error("Error reseteando contraseña:", err);
        res.status(500).json({ error: "Error reseteando contraseña" });
    }
});

// Reenviar email de verificación
router.post("/resend-verification", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email es requerido" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        if (user.emailVerified) {
            return res.status(400).json({ error: "Email ya verificado" });
        }

        // Generar nuevo token de verificación
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        await user.save();

        // Enviar email de verificación
        await sendVerificationEmail(email, verificationToken);

        res.json({ message: "Email de verificación reenviado" });
    } catch (err) {
        console.error("Error reenviando verificación:", err);
        res.status(500).json({ error: "Error reenviando verificación" });
    }
});

// Endpoint temporal para debug - obtener token de verificación
router.get("/debug-token/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        res.json({
            email: user.email,
            verificationToken: user.verificationToken,
            emailVerified: user.emailVerified,
            testUrl: `http://localhost:4000/auth/verify/${user.verificationToken}`
        });
    } catch (err) {
        console.error("Error obteniendo token:", err);
        res.status(500).json({ error: "Error obteniendo token" });
    }
});

export default router;
