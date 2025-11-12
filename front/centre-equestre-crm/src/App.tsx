import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import './App.css'

function App() {
  return (
    <AppLayout>
      <Suspense fallback={<p>Chargement...</p>}>
        <Outlet />
      </Suspense>
    </AppLayout>
  )
}

export default App
