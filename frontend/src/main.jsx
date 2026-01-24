import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { TransactionProvider } from './context/TransactionContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <TransactionProvider>
          <App />
        </TransactionProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)