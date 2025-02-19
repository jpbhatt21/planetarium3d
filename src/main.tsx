import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'jotai'
import { store } from './atoms.ts'
createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
    <App />
    </Provider>
    ,
)
