"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_model_1 = require("../models/user.model");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Completar onboarding
router.post("/complete", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { idioma_principal, idioma_objetivo, preferencia_genero, nivel_idioma, intereses, pais, edad } = req.body;
        // Validar datos requeridos
        if (!idioma_principal || !idioma_objetivo || !pais || !edad) {
            return res.status(400).json({
                error: "Faltan datos requeridos: idioma_principal, idioma_objetivo, pais, edad"
            });
        }
        // Actualizar usuario
        const user = await user_model_1.User.findByIdAndUpdate(req.user._id, {
            idioma_principal,
            idioma_objetivo,
            preferencia_genero: preferencia_genero || "A",
            nivel_idioma: nivel_idioma || "principiante",
            intereses: intereses || [],
            pais,
            edad,
            onboardingCompleted: true
        }, { new: true });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
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
            }
        });
    }
    catch (err) {
        console.error("Error completando onboarding:", err);
        res.status(500).json({ error: "Error completando onboarding" });
    }
});
// Obtener estado del onboarding
router.get("/status", auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const user = await user_model_1.User.findById(req.user._id).select('onboardingCompleted idioma_principal idioma_objetivo');
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        res.json({
            onboardingCompleted: user.onboardingCompleted,
            hasBasicInfo: !!(user.idioma_principal && user.idioma_objetivo)
        });
    }
    catch (err) {
        console.error("Error obteniendo estado del onboarding:", err);
        res.status(500).json({ error: "Error obteniendo estado del onboarding" });
    }
});
exports.default = router;
