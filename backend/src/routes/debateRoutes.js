// routes/debateRoutes.js
import express from 'express';
import {
    createDebate,
    getDebateDetails,
    getDebateList,
    likeDebate,
    voteDebate,
    commentOnDebate,
} from '../controllers/debateController.js';

const router = express.Router();

router.get('/', getDebateList);
router.post('/', createDebate);
router.get('/:id', getDebateDetails);
router.post('/:id/vote', voteDebate);
router.post('/:id/like', likeDebate);
router.post('/:id/comment', commentOnDebate);

export default router;
