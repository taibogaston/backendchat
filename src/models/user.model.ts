import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    nombre: string;
    email: string;
    password?: string; // Opcional para usuarios de Google
    googleId?: string; // Para usuarios autenticados con Google
    emailVerified: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    onboardingCompleted: boolean;
    idioma_principal?: string;
    idioma_objetivo?: string;
    preferencia_genero: "M" | "F" | "A";
    nivel_idioma: "principiante" | "intermedio" | "avanzado";
    intereses: string[];
    pais?: string;
    edad?: number;
}

const userSchema = new Schema<IUser>(
    {
        nombre: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Opcional para usuarios de Google
        googleId: { type: String, unique: true, sparse: true }, // Para usuarios de Google
        emailVerified: { type: Boolean, default: false },
        verificationToken: { type: String },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
        onboardingCompleted: { type: Boolean, default: false },
        idioma_principal: { type: String },
        idioma_objetivo: { type: String },
        preferencia_genero: { type: String, enum: ["M", "F", "A"], default: "A" },
        nivel_idioma: { 
            type: String, 
            enum: ["principiante", "intermedio", "avanzado"], 
            default: "principiante" 
        },
        intereses: [{ type: String }],
        pais: { type: String },
        edad: { type: Number, min: 13, max: 100 }
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
