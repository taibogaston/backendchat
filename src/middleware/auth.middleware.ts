import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

// Extender la interfaz Request para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

// Middleware de autenticación
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Token de acceso requerido' });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        
        // Buscar usuario
        const user = await User.findById(decoded.userId).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
        
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        // Verificar que el email esté verificado
        if (!user.emailVerified) {
            return res.status(401).json({ error: 'Email no verificado' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(403).json({ error: 'Token inválido' });
    }
};

// Middleware opcional de autenticación (no falla si no hay token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            const user = await User.findById(decoded.userId).select('-password -verificationToken -resetPasswordToken -resetPasswordExpires');
            
            if (user && user.emailVerified) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Si hay error con el token, continuar sin usuario autenticado
        next();
    }
};
