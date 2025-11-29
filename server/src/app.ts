import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes'; 
import promptRoutes from './routes/promptRoutes';
import chatRoutes from './routes/chatRoutes';
import documentRoutes from './routes/documentRoutes';

const app: Application = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/prompts', promptRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Smart Chat AI Backend is Running 🚀' 
  });
});

export default app;