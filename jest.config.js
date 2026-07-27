// jest.config.js
// Usando .js para evitar la dependencia de ts-node en el config de Jest.
// Los tests siguen siendo TypeScript — solo el archivo de configuración es JS.

/** @type {import('jest').Config} */
const config = {
  // ts-jest transforma TypeScript a JS compatible con Jest (CommonJS)
  preset: 'ts-jest',

  // Entorno de ejecución Node (sin browser APIs)
  testEnvironment: 'node',

  // Dónde buscar los tests
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],

  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],

  // Aliases de módulos (igual que en tsconfig paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Ignora node_modules y .next
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  // Override de tsconfig para Jest (usa CommonJS en lugar de bundler)
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'commonjs',
          moduleResolution: 'node',
        },
      },
    ],
  },
}

module.exports = config
