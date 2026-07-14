import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, globalIgnores } from 'eslint/config';
import { FlatCompat } from '@eslint/eslintrc';

// eslint-config-next 15.x ships legacy (eslintrc) configs only; FlatCompat is
// the officially documented bridge until the config ships flat exports in 16.
const compat = new FlatCompat({
    baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
});

export default defineConfig([
    // Paths `next lint` used to ignore implicitly; plain `eslint .` does not.
    globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
    ...compat.extends('next/core-web-vitals'),
]);
