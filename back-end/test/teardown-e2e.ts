import { TestContainer } from './test-container';

export default async function globalTeardown() {
  await TestContainer.stop();
}
