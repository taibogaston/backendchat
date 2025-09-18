"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Configurar transporter de nodemailer con Mailtrap
const createTransporter = () => {
    // Credenciales de prueba de Mailtrap (funcionan sin configuración)
    const testCredentials = {
        user: 'test_user',
        pass: 'test_pass'
    };
    // Si tienes credenciales reales, úsalas; si no, usa las de prueba
    const credentials = (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS)
        ? { user: process.env.MAILTRAP_USER, pass: process.env.MAILTRAP_PASS }
        : testCredentials;
    return nodemailer_1.default.createTransport({
        host: 'sandbox.smtp.mailtrap.io',
        port: 2525,
        auth: credentials
    });
};
// Enviar email de verificación
const sendVerificationEmail = async (email, token) => {
    try {
        const transporter = createTransporter();
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verifica tu cuenta - ChatBot',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">¡Bienvenido a ChatBot!</h2>
                    <p>Gracias por registrarte. Para completar tu registro, por favor verifica tu email haciendo clic en el siguiente enlace:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" 
                           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verificar Email
                        </a>
                    </div>
                    <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
                    <p>Este enlace expirará en 24 horas.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">Si no creaste esta cuenta, puedes ignorar este email.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email de verificación enviado a: ${email}`);
    }
    catch (error) {
        console.error('Error enviando email de verificación:', error);
        throw error;
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
// Enviar email de reset de contraseña
const sendPasswordResetEmail = async (email, token) => {
    try {
        const transporter = createTransporter();
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset de Contraseña - ChatBot',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Reset de Contraseña</h2>
                    <p>Recibiste este email porque solicitaste resetear tu contraseña.</p>
                    <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Resetear Contraseña
                        </a>
                    </div>
                    <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                    <p>Este enlace expirará en 1 hora.</p>
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">Si no solicitaste este reset, puedes ignorar este email. Tu contraseña no será cambiada.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email de reset de contraseña enviado a: ${email}`);
    }
    catch (error) {
        console.error('Error enviando email de reset:', error);
        throw error;
    }
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
