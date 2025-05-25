import { Routes, Route } from 'react-router-dom';
import BarcodeScannerApp from './BarcodeScannerApp';
import AdminExportApp from './AdminExportApp';

function App() {
  return (
    <Routes>
      <Route path="/" element={<BarcodeScannerApp />} />
      <Route path="/admin" element={<AdminExportApp />} />
    </Routes>
  );
}
export default App;
