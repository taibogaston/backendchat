import { Router } from "express";
import { User } from "../models/user.model";
import { Chat } from "../models/chat.model";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Listar todos los usuarios (simple, para panel)
router.get("/", async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        const mapped = users.map((u) => ({
            id: u._id,
            nombre: u.nombre,
            email: u.email,
            idioma_principal: u.idioma_principal,
            idioma_objetivo: u.idioma_objetivo,
            nivel_idioma: u.nivel_idioma,
            intereses: u.intereses,
            pais: u.pais,
            edad: u.edad,
            preferencia_genero: u.preferencia_genero,
        }));
        res.json(mapped);
    } catch (err) {
        res.status(500).json({ error: "Error listando usuarios" });
    }
});

router.post("/register", async (req, res) => {
    try {
        const { 
            nombre, 
            email, 
            idioma_principal, 
            idioma_objetivo,
            preferencia_genero, 
            nivel_idioma,
            intereses,
            pais,
            edad
        } = req.body;

        // Validar datos requeridos
        if (!nombre || !email || !idioma_principal || !idioma_objetivo || !pais || !edad) {
            return res.status(400).json({ 
                error: "Faltan datos requeridos: nombre, email, idioma_principal, idioma_objetivo, pais, edad" 
            });
        }

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        const user = await User.create({
            nombre,
            email,
            idioma_principal,
            idioma_objetivo,
            preferencia_genero: preferencia_genero || "A",
            nivel_idioma: nivel_idioma || "principiante",
            intereses: intereses || [],
            pais,
            edad
        });

        // Crear personaje por defecto basado en el idioma objetivo
        const defaultPartner = createDefaultPartner(idioma_objetivo, preferencia_genero);

        const chat = await Chat.create({
            userId: user._id,
            partner: defaultPartner,
            activo: true
        });

        res.status(201).json({ 
            user: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                idioma_principal: user.idioma_principal,
                idioma_objetivo: user.idioma_objetivo,
                nivel_idioma: user.nivel_idioma,
                intereses: user.intereses,
                pais: user.pais,
                edad: user.edad
            },
            defaultChat: {
                id: chat._id,
                partner: chat.partner,
                activo: chat.activo,
                createdAt: chat.createdAt
            }
        });
    } catch (err) {
        console.error("Error registrando usuario:", err);
        res.status(500).json({ error: "Error registrando usuario" });
    }
});

// Función para crear personaje por defecto según idioma objetivo
function createDefaultPartner(idiomaObjetivo: string, preferenciaGenero: string) {
    const partners = {
        "español": {
            "F": { nombre: "Camila", nacionalidad: "Colombia", genero: "F" },
            "M": { nombre: "Mateo", nacionalidad: "España", genero: "M" },
            "A": { nombre: "Sofia", nacionalidad: "México", genero: "F" }
        },
        "inglés": {
            "F": { nombre: "Emily", nacionalidad: "Estados Unidos", genero: "F" },
            "M": { nombre: "James", nacionalidad: "Reino Unido", genero: "M" },
            "A": { nombre: "Sarah", nacionalidad: "Canadá", genero: "F" }
        },
        "francés": {
            "F": { nombre: "Marie", nacionalidad: "Francia", genero: "F" },
            "M": { nombre: "Pierre", nacionalidad: "Francia", genero: "M" },
            "A": { nombre: "Claire", nacionalidad: "Francia", genero: "F" }
        },
        "portugués": {
            "F": { nombre: "Ana", nacionalidad: "Brasil", genero: "F" },
            "M": { nombre: "João", nacionalidad: "Brasil", genero: "M" },
            "A": { nombre: "Isabela", nacionalidad: "Brasil", genero: "F" }
        },
        "alemán": {
            "F": { nombre: "Anna", nacionalidad: "Alemania", genero: "F" },
            "M": { nombre: "Hans", nacionalidad: "Alemania", genero: "M" },
            "A": { nombre: "Lisa", nacionalidad: "Alemania", genero: "F" }
        },
        "italiano": {
            "F": { nombre: "Giulia", nacionalidad: "Italia", genero: "F" },
            "M": { nombre: "Marco", nacionalidad: "Italia", genero: "M" },
            "A": { nombre: "Sofia", nacionalidad: "Italia", genero: "F" }
        },
        "japonés": {
            "F": { nombre: "Yuki", nacionalidad: "Japón", genero: "F" },
            "M": { nombre: "Hiroshi", nacionalidad: "Japón", genero: "M" },
            "A": { nombre: "Sakura", nacionalidad: "Japón", genero: "F" }
        }
    };

    const idiomaKey = idiomaObjetivo.toLowerCase();
    const generoKey = preferenciaGenero || "A";
    
    const partner = (partners as any)[idiomaKey]?.[generoKey] || (partners as any)[idiomaKey]?.["A"] || {
        nombre: "Alex",
        nacionalidad: "Internacional",
        genero: "A"
    };

    return {
        ...partner,
        idioma_objetivo: idiomaObjetivo
    };
}

// Obtener información del usuario autenticado
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        res.json({
            id: user._id,
            nombre: user.nombre,
            email: user.email,
            emailVerified: user.emailVerified,
            onboardingCompleted: user.onboardingCompleted,
            idioma_principal: user.idioma_principal,
            idioma_objetivo: user.idioma_objetivo,
            nivel_idioma: user.nivel_idioma,
            intereses: user.intereses,
            pais: user.pais,
            edad: user.edad,
            preferencia_genero: user.preferencia_genero
        });
    } catch (err) {
        res.status(500).json({ error: "Error obteniendo usuario" });
    }
});

// Actualizar preferencias del usuario autenticado
router.patch("/preferences", authenticateToken, async (req, res) => {
    try {
        const { idioma_objetivo, nivel_idioma, intereses, preferencia_genero } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { 
                idioma_objetivo, 
                nivel_idioma, 
                intereses, 
                preferencia_genero 
            },
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        
        res.json({
            id: user._id,
            nombre: user.nombre,
            idioma_objetivo: user.idioma_objetivo,
            nivel_idioma: user.nivel_idioma,
            intereses: user.intereses,
            preferencia_genero: user.preferencia_genero
        });
    } catch (err) {
        res.status(500).json({ error: "Error actualizando preferencias" });
    }
});

export default router;
