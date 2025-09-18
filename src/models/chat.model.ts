import mongoose, { Schema, Document, Types } from "mongoose";

export interface IChat extends Document {
    userId: Types.ObjectId;
    partner: {
        nombre: string;
        nacionalidad: string;
        genero: "M" | "F";
        idioma_objetivo: string;
    };
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        partner: {
            nombre: String,
            nacionalidad: String,
            genero: { type: String, enum: ["M", "F"] },
            idioma_objetivo: String
        },
        activo: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const Chat = mongoose.model<IChat>("Chat", chatSchema);
