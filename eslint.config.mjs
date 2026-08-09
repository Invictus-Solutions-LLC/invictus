import { defineConfig, globalIgnores } from 'eslint/config';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

// eslint-config-next 16 ships native flat config (an array), so it's spread
// directly here — no FlatCompat bridge needed (that was only for the 15.x
// eslintrc-only configs, and wrapping the now-flat export trips a circular ref).
export default defineConfig([
    // Paths `next lint` used to ignore implicitly; plain `eslint .` does not.
    globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', 'next-env.d.ts']),
    ...nextCoreWebVitals,
]);
