import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppContext } from './context/AppContext.jsx'
import InputPage from './pages/InputPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import SummaryPage from './pages/SummaryPage.jsx'
import DisclaimerBanner from './components/DisclaimerBanner.jsx'

function RequireHistory({ children }) {
  const { state } = useAppContext()
  if (state.moveHistory.length === 0) {
    return <Navigate to="/" replace />
  }
  return children
}

export default function App() {
  return (
    <>
      <DisclaimerBanner />
      <Routes>
        <Route path="/" element={<InputPage />} />
        <Route
          path="/results"
          element={
            <RequireHistory>
              <ResultsPage />
            </RequireHistory>
          }
        />
        <Route
          path="/summary"
          element={
            <RequireHistory>
              <SummaryPage />
            </RequireHistory>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
