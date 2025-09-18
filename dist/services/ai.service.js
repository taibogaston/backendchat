"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithAI = chatWithAI;
const axios_1 = __importDefault(require("axios"));
const roleplayPrompt_1 = require("../prompts/roleplayPrompt");
async function chatWithAI(messages, partner) {
    var _a, _b, _c;
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY)
        throw new Error("OPENAI_API_KEY no definido en .env");
    const personaInstruction = partner
        ? `\n\nContexto de personaje asignado al chat:\n- Nombre: ${partner.nombre}\n- Nacionalidad: ${partner.nacionalidad}\n- Género: ${partner.genero}\n- Idioma a usar principalmente: ${partner.idioma_objetivo}\n\nInstrucciones adicionales obligatorias:\n- Responde SIEMPRE como ${partner.nombre} de ${partner.nacionalidad}.\n- Usa principalmente el idioma "${partner.idioma_objetivo}" a menos que el usuario pida explícitamente otra cosa.\n- Mantén coherencia de identidad en todas las respuestas de este chat.`
        : "";
    const body = {
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: roleplayPrompt_1.roleplayPrompt + personaInstruction },
            ...messages
        ],
        max_tokens: 300
    };
    const res = await axios_1.default.post("https://api.openai.com/v1/chat/completions", body, {
        headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            "Content-Type": "application/json"
        }
    });
    return ((_c = (_b = (_a = res.data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || "";
}
