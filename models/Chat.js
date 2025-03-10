import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new Schema({
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [MessageSchema],
    lastUpdated: { type: Date, default: Date.now }
});

ChatSchema.pre('save', function (next) {
    this.lastUpdated = Date.now();
    next();
});

const ChatModel = mongoose.model("Chat", ChatSchema);

export { ChatModel as Chat };
