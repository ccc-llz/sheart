import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectMongo } from './src/models/db.js';
import path from 'path';
import avatarRoutes from './src/routes/avatar.js';
import authRoutes from './src/routes/authRoutes.js';
import debateRoutes from './src/routes/debateRoutes.js';
import newsRoutes from './src/routes/news.js';
import userRoutes from './src/routes/user.js';
import relationRoutes from './src/routes/relations.js';
import adminInvitesRouter from './src/routes/admin.invites.js';
import confessionRoutes from './src/routes/confessionRoutes.js';
import dailyPostRoutes from './src/routes/dailyPostRoutes.js';
import likeRoutes from './src/routes/likes.js';
import uploadRoutes from './src/routes/upload.js';



const app = express();
const PORT = process.env.PORT || 5000;
await connectMongo();

// 静态文件
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/debate', debateRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/relations', relationRoutes);
app.use('/api/users', avatarRoutes);
app.use('/api', adminInvitesRouter);
app.use('/api/confessions', confessionRoutes);
app.use('/api/daily-posts', dailyPostRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api', (req, res) => {
    res.json({ message: 'Sheart Backend API' });
});




app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});