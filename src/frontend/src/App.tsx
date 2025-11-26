import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/layout/Layout'
import Overview from './pages/Overview'
import MaxFlow from './pages/MaxFlow'
import MaterialPart from './pages/MaterialPart'
import SupplierMaterial from './pages/SupplierMaterial'
import TariffMaterial from './pages/TariffMaterial'
import SupplierProduct from './pages/SupplierProduct'
import SupplierTier from './pages/SupplierTier'
import Recommendations from './pages/Recommendations'
import ExecutiveBriefing from './pages/ExecutiveBriefing'

function App() {
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/max-flow" element={<MaxFlow />} />
          <Route path="/material-part" element={<MaterialPart />} />
          <Route path="/supplier-material" element={<SupplierMaterial />} />
          <Route path="/tariff-material" element={<TariffMaterial />} />
          <Route path="/supplier-product" element={<SupplierProduct />} />
          <Route path="/supplier-tier" element={<SupplierTier />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/executive-briefing" element={<ExecutiveBriefing />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}

export default App
