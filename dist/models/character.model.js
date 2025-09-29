"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Character = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const characterSchema = new mongoose_1.Schema({
    nombre: { type: String, required: true, unique: true },
    nacionalidad: { type: String, required: true },
    genero: { type: String, enum: ["M", "F"], required: true },
    idioma_objetivo: { type: String, required: true },
    personalidad: {
        descripcion: { type: String, required: true },
        rasgos: [{ type: String }],
        motivaciones: [{ type: String }],
        miedos: [{ type: String }],
        sueños: [{ type: String }],
        hobbies: [{ type: String }],
        profesion: { type: String, required: true },
        edad: { type: Number, required: true, min: 18, max: 80 },
        estado_civil: { type: String, required: true },
        familia: { type: String, required: true },
        lugar_nacimiento: { type: String, required: true },
        residencia_actual: { type: String, required: true }
    },
    historia_personal: {
        infancia: { type: String, required: true },
        juventud: { type: String, required: true },
        vida_actual: { type: String, required: true },
        experiencias_clave: [{ type: String }],
        anecdotas: [{ type: String }]
    },
    contexto_cultural: {
        tradiciones: [{ type: String }],
        comida_favorita: [{ type: String }],
        musica_preferida: [{ type: String }],
        lugares_importantes: [{ type: String }],
        festividades: [{ type: String }],
        costumbres: [{ type: String }]
    },
    estilo_conversacional: {
        tono: { type: String, required: true },
        expresiones_tipicas: [{ type: String }],
        palabras_clave: [{ type: String }],
        nivel_formalidad: { type: String, enum: ["formal", "informal", "mixto"], required: true },
        velocidad_habla: { type: String, enum: ["lenta", "normal", "rapida"], required: true }
    },
    restricciones: {
        idiomas_permitidos: [{ type: String }],
        temas_evitar: [{ type: String }],
        temas_favoritos: [{ type: String }],
        nivel_enseñanza: { type: String, enum: ["principiante", "intermedio", "avanzado"], required: true }
    },
    activo: { type: Boolean, default: true }
}, { timestamps: true });
exports.Character = mongoose_1.default.model("Character", characterSchema);
