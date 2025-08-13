import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import debateRoutes from './src/routes/debateRoutes.js';
import newsRoutes from './src/routes/news.js';
import userRoutes from './src/routes/user.js';
import relationRoutes from './src/routes/relations.js';
import confessionRoutes from './src/routes/confessionRoutes.js';
import dailyPostRoutes from './src/routes/dailyPostRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/debate', debateRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/relations', relationRoutes);
app.use('/api/confessions', confessionRoutes);
app.use('/api/daily-posts', dailyPostRoutes);

app.get('/api', (req, res) => {
    res.json({ message: 'Sheart Backend API' });
});

// Routes
// app.use('/auth', authRoutes);
// app.use('/home', homeRoutes);
// app.use('/confession', confessionRoutes);
// app.use('/debate', debateRoutes);
// app.use('/daily', dailyRoutes);
// app.use('/news', newsRoutes);
// app.use('/profile', profileRoutes);

// You can keep this, but it's not a common API endpoint.
// A more standard practice might be to have a root endpoint that returns API status.
app.get('/', (req, res) => {
    res.json({ message: 'Sheart Backend API' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});