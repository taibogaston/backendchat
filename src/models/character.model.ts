import mongoose, { Schema, Document } from "mongoose";

export interface ICharacter extends Document {
    nombre: string;
    nacionalidad: string;
    genero: "M" | "F";
    idioma_objetivo: string;
    personalidad: {
        descripcion: string;
        rasgos: string[];
        motivaciones: string[];
        miedos: string[];
        sueños: string[];
        hobbies: string[];
        profesion: string;
        edad: number;
        estado_civil: string;
        familia: string;
        lugar_nacimiento: string;
        residencia_actual: string;
    };
    historia_personal: {
        infancia: string;
        juventud: string;
        vida_actual: string;
        experiencias_clave: string[];
        anecdotas: string[];
    };
    contexto_cultural: {
        tradiciones: string[];
        comida_favorita: string[];
        musica_preferida: string[];
        lugares_importantes: string[];
        festividades: string[];
        costumbres: string[];
    };
    estilo_conversacional: {
        tono: string;
        expresiones_tipicas: string[];
        palabras_clave: string[];
        nivel_formalidad: "formal" | "informal" | "mixto";
        velocidad_habla: "lenta" | "normal" | "rapida";
    };
    restricciones: {
        idiomas_permitidos: string[];
        temas_evitar: string[];
        temas_favoritos: string[];
        nivel_enseñanza: "principiante" | "intermedio" | "avanzado";
    };
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const characterSchema = new Schema<ICharacter>(
    {
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
    },
    { timestamps: true }
);

export const Character = mongoose.model<ICharacter>("Character", characterSchema);
