import { Types, Document, Schema, model } from "mongoose";

export interface IMessage extends Document {
    chatId: Types.ObjectId;
    sender: "user" | "ia";
    content: string;
}

const messageSchema = new Schema<IMessage>(
    {
        chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
        sender: { type: String, enum: ["user", "ia"], required: true },
        content: { type: String, required: true }
    },
    { timestamps: true }
);

export const Message = model<IMessage>("Message", messageSchema);
