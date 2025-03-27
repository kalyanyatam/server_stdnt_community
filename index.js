import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { UserRouter } from './routes/user.js';
import { ChatRouter } from './routes/chat.js';
import http from 'http';
import { Server } from 'socket.io';
import { Chat } from './models/Chat.js';
import { PostRouter } from './routes/post.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));
app.use(cookieParser());

// Routes
app.use('/auth', UserRouter);
app.use('/api/post', PostRouter);
app.use('/api/chats', ChatRouter); // Ensure API prefix is consistent

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');

        // Create HTTP server
        const server = http.createServer(app);

        // Initialize Socket.IO
        const io = new Server(server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        // Socket.IO connection event
        io.on('connection', (socket) => {
            console.log('A user connected:', socket.id);

            // Join a chat room
            socket.on('joinRoom', ({ chatId }) => {
                socket.join(chatId);
                console.log(`User ${socket.id} joined room ${chatId}`);
            });

            // Handle sending messages
            socket.on('sendMessage', async ({ chatId, senderId, content }) => {
                try {
                    const chat = await Chat.findById(chatId);
                    if (chat) {
                        const message = { sender: senderId, content };
                        chat.messages.push(message);
                        await chat.save();
                        io.to(chatId).emit('message', message);
                    }
                } catch (error) {
                    console.error("Error sending message:", error);
                }
            });

            // Disconnect event
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });

        // Start the server with error handling
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use.`);
            } else {
                console.error('Error starting server:', err);
            }
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
