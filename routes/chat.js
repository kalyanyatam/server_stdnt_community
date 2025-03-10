// server/routes/chat.js
import express from 'express';
import { Chat } from '../models/Chat.js';

const router = express.Router();

// Create a new chat
router.post('/create', async (req, res) => {
    const { userId1, userId2 } = req.body;

    try {
        const newChat = new Chat({
            participants: [userId1, userId2],
            messages: []
        });

        await newChat.save();
        res.status(201).json(newChat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Retrieve chat history
router.get('/:userId1/:userId2', async (req, res) => {
    const { userId1, userId2 } = req.params;

    try {
        const chat = await Chat.findOne({
            participants: { $all: [userId1, userId2] }
        }).populate('participants').populate('messages.sender');

        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export { router as ChatRouter };
