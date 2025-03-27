import express from 'express';
import { Chat } from '../models/Chat.js';
import { Message } from '../models/Message.js'; // Import Message model

const router = express.Router();

// Create or get a chat between two users
router.post('/create', async (req, res) => {
    const { userId1, userId2 } = req.body;

    try {
        let chat = await Chat.findOne({
            participants: { $all: [userId1, userId2] }
        });

        if (!chat) {
            chat = new Chat({
                participants: [userId1, userId2],
                messages: []
            });
            await chat.save();
        }

        res.status(201).json(chat);
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
        }).populate('messages.sender');

        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send a message
router.post('/:chatId/send', async (req, res) => {
    const { chatId } = req.params;
    const { senderId, text } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }

        const newMessage = new Message({
            sender: senderId,
            text,
            timestamp: new Date()
        });

        await newMessage.save();
        chat.messages.push(newMessage);
        await chat.save();

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export { router as ChatRouter };
