import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

export class TestContainer {
  private static container: StartedPostgreSqlContainer | null = null;
  private static connectionUri: string | null = null;

  static async start(): Promise<string> {
    if (TestContainer.container && TestContainer.connectionUri) {
      return TestContainer.connectionUri;
    }

    TestContainer.container = await new PostgreSqlContainer(
      'postgres:18-alpine',
    )
      .withUsername('testuser')
      .withPassword('testpass')
      .withDatabase('testdb')
      .start();

    TestContainer.connectionUri = TestContainer.container.getConnectionUri();
    process.env.DATABASE_URL = TestContainer.connectionUri;

    return TestContainer.connectionUri;
  }

  static async stop(): Promise<void> {
    if (TestContainer.container) {
      await TestContainer.container.stop();
      TestContainer.container = null;
      TestContainer.connectionUri = null;
    }
  }
}
