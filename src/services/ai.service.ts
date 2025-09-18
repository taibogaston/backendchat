import axios from "axios";
import { roleplayPrompt } from "../prompts/roleplayPrompt";

type Partner = {
    nombre: string;
    nacionalidad: string;
    genero: "M" | "F";
    idioma_objetivo: string;
};

export async function chatWithAI(
    messages: { role: string; content: string }[],
    partner?: Partner
) {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) throw new Error("OPENAI_API_KEY no definido en .env");

    const personaInstruction = partner
        ? `\n\nContexto de personaje asignado al chat:\n- Nombre: ${partner.nombre}\n- Nacionalidad: ${partner.nacionalidad}\n- Género: ${partner.genero}\n- Idioma a usar principalmente: ${partner.idioma_objetivo}\n\nInstrucciones adicionales obligatorias:\n- Responde SIEMPRE como ${partner.nombre} de ${partner.nacionalidad}.\n- Usa principalmente el idioma "${partner.idioma_objetivo}" a menos que el usuario pida explícitamente otra cosa.\n- Mantén coherencia de identidad en todas las respuestas de este chat.`
        : "";

    const body = {
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: roleplayPrompt + personaInstruction },
            ...messages
        ],
        max_tokens: 300
    };

    const res = await axios.post("https://api.openai.com/v1/chat/completions", body, {
        headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            "Content-Type": "application/json"
        }
    });

    return res.data.choices?.[0]?.message?.content || "";
}
