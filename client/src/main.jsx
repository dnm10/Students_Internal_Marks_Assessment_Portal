import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { store } from './store/store.js'
import './index.css'

if (import.meta.env.DEV) {
  localStorage.clear();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background:   '#1e293b',
              color:        '#f1f5f9',
              border:       '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.75rem',
              fontSize:     '0.875rem',
              fontFamily:   'Inter, sans-serif',
              backdropFilter: 'blur(12px)',
              boxShadow:    '0 4px 20px rgba(0,0,0,0.4)',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
