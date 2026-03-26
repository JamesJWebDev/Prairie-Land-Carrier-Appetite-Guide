const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/renderer/lib/**/*.ts', 'js/**/*.js'],
      exclude: ['tests/**', 'node_modules/**'],
    },
    globals: true,
  },
});
