import express from 'express';
import { sendTicket } from '../controllers/ticketController.js';

const router = express.Router();

router.post('/send-ticket', sendTicket);
export default router;
