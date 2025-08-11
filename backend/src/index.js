import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import homeRoutes from './routes/home.js';
import confessionRoutes from './routes/confession.js';
import debateRoutes from './routes/debate.js';
import dailyRoutes from './routes/daily.js';
import newsRoutes from './routes/news.js';
import profileRoutes from './routes/profile.js';

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
// app.use('/api/auth', authRoutes);
// app.use('/api/home', homeRoutes);
// app.use('/api/confession', confessionRoutes);
// app.use('/api/debate', debateRoutes);
// app.use('/api/daily', dailyRoutes);
// app.use('/api/news', newsRoutes);
// app.use('/api/profile', profileRoutes);
//
// app.get('/api', (req, res) => {
//     res.json({ message: 'Sheart Backend API' });
// });

// Routes
app.use('/auth', authRoutes);
app.use('/home', homeRoutes);
app.use('/confession', confessionRoutes);
app.use('/debate', debateRoutes);
app.use('/daily', dailyRoutes);
app.use('/news', newsRoutes);
app.use('/profile', profileRoutes);

// You can keep this, but it's not a common API endpoint.
// A more standard practice might be to have a root endpoint that returns API status.
app.get('/', (req, res) => {
    res.json({ message: 'Sheart Backend API' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});