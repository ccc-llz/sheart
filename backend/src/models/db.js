// src/db/mongo.js
import mongoose from 'mongoose';

const DEFAULT_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sheart';

const DEFAULT_OPTS = {
    maxPoolSize: 10,
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
};

let connectingPromise = null;

/** 建立（或复用）连接：返回已连接的 mongoose */
export async function connectMongo(uri = DEFAULT_URI, opts = {}) {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState === 1) return mongoose;
    if (connectingPromise) return connectingPromise;

    connectingPromise = mongoose.connect(uri, { ...DEFAULT_OPTS, ...opts })
        .then(() => {
            console.log('[mongo] connected:', uri);
            return mongoose;
        })
        .catch((err) => {
            console.error('[mongo] connection error:', err);
            connectingPromise = null;
            throw err;
        });

    return connectingPromise;
}

/** 便捷导出 */
export const db = mongoose.connection;
export default mongoose;

export async function disconnectMongo() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log('[mongo] disconnected');
    }
}

// 可选：日志
db.on('error', (err) => console.error('[mongo] error:', err));
