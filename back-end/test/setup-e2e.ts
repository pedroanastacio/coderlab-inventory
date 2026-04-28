import { execSync } from 'child_process';
import path from 'path';
import { TestContainer } from './test-container';

export default async function globalSetup() {
  const connectionString = await TestContainer.start();
  process.env.DATABASE_URL = connectionString;

  execSync('npx prisma migrate deploy', {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: connectionString },
    stdio: 'inherit',
  });
}
