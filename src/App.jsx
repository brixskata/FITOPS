import AppRoutes from './routes/AppRoutes'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <>
      <AppRoutes />
      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#101010',
            borderRadius: '18px',
            border: '1px solid rgba(16, 16, 16, 0.08)',
            boxShadow: '0 18px 60px rgba(18, 18, 18, 0.12)',
            padding: '14px 16px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#ffd900',
              secondary: '#101010',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </>
  )
}
