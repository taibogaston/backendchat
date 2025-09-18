import { Router } from "express";
import { User } from "../models/user.model";
import { Chat } from "../models/chat.model";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Completar onboarding
router.post("/complete", authenticateToken, async (req, res) => {
    try {
        const { 
            idioma_principal, 
            idioma_objetivo,
            preferencia_genero, 
            nivel_idioma,
            intereses,
            pais,
            edad
        } = req.body;

        // Validar datos requeridos
        if (!idioma_principal || !idioma_objetivo || !pais || !edad) {
            return res.status(400).json({ 
                error: "Faltan datos requeridos: idioma_principal, idioma_objetivo, pais, edad" 
            });
        }

        // Actualizar usuario
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                idioma_principal,
                idioma_objetivo,
                preferencia_genero: preferencia_genero || "A",
                nivel_idioma: nivel_idioma || "principiante",
                intereses: intereses || [],
                pais,
                edad,
                onboardingCompleted: true
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        // Crear personaje por defecto basado en el idioma objetivo
        const defaultPartner = createDefaultPartner(idioma_objetivo, preferencia_genero);

        const chat = await Chat.create({
            userId: user._id,
            partner: defaultPartner,
            activo: true
        });

        res.json({ 
            message: "Onboarding completado exitosamente",
            user: {
                id: user._id,
                nombre: user.nombre,
                email: user.email,
                idioma_principal: user.idioma_principal,
                idioma_objetivo: user.idioma_objetivo,
                nivel_idioma: user.nivel_idioma,
                intereses: user.intereses,
                pais: user.pais,
                edad: user.edad,
                preferencia_genero: user.preferencia_genero,
                onboardingCompleted: user.onboardingCompleted
            },
            defaultChat: {
                id: chat._id,
                partner: chat.partner,
                activo: chat.activo,
                createdAt: chat.createdAt
            }
        });
    } catch (err) {
        console.error("Error completando onboarding:", err);
        res.status(500).json({ error: "Error completando onboarding" });
    }
});

// Obtener estado del onboarding
router.get("/status", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('onboardingCompleted idioma_principal idioma_objetivo');
        
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({
            onboardingCompleted: user.onboardingCompleted,
            hasBasicInfo: !!(user.idioma_principal && user.idioma_objetivo)
        });
    } catch (err) {
        console.error("Error obteniendo estado del onboarding:", err);
        res.status(500).json({ error: "Error obteniendo estado del onboarding" });
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

export default router;
