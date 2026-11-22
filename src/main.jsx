import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import './styles/tokens.css'
import './index.css'
import './styles/sections.css'
import './styles/work.css'
import './styles/journey.css'
import './styles/interactions.css'
import './styles/depth.css'
import './styles/cosmos.css'
import './styles/polish.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </StrictMode>,
)