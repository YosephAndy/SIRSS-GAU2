// jest.config.ts
import type { Config } from 'jest'

const config: Config = {
  // ts-jest transforma TypeScript a JS compatible con Jest (CommonJS)
  preset: 'ts-jest',

  // Entorno de ejecución (Node, no browser)
  testEnvironment: 'node',

  // Dónde buscar los tests
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],

  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],

  // Aliases de módulos (igual que en tsconfig.json paths)
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

export default config
