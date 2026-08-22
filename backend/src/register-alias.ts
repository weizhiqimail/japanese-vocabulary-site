import { addAlias } from 'module-alias';
import { join } from 'node:path';

// Vercel's TypeScript entry runs from src/, while the complete Nest build is
// explicitly bundled from dist/. Local and conventional deployments run dist/.
addAlias('@', process.env.VERCEL ? join(process.cwd(), 'dist') : __dirname);
