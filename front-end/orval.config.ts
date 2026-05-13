import { defineConfig } from 'orval';

const apiUrl = process.env.VITE_API_URL || 'http://localhost:3000';

export default defineConfig({
  api: {
    input: {
      target: `${apiUrl}/api-json`,
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/generated/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
    },
  },
});
