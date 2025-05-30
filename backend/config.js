import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

export const config = {
    pnr: {
        apiKey: process.env.PNR_API_KEY,
        host: 'irctc-indian-railway-pnr-status.p.rapidapi.com'
    },
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    }
};

export default config; 