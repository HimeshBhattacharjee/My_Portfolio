import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Unconfirmed content lives in src/data/drafts.js for review during development. In a
// production build that module is swapped for an empty one, so draft text can never be read
// in the shipped JavaScript (rendering filters alone would still bundle it).
const DRAFTS_MODULE = /[\\/]src[\\/]data[\\/]drafts\.js$/

const stripDrafts = () => ({
    name: 'strip-drafts',
    apply: 'build',
    enforce: 'pre',
    load(id) {
        return DRAFTS_MODULE.test(id) ? 'export const draftPoints = {}; export const draftHonours = [];' : null
    },
})

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [stripDrafts(), react()],
})