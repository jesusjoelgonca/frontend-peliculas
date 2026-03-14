import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { GenerosPage } from './pages/Generos/GenerosPage';
import { DirectoresPage } from './pages/Directores/DirectoresPage';
import { ProductorasPage } from './pages/Productoras/ProductorasPage';
import { TiposPage } from './pages/Tipos/TiposPage';
import { MediaPage } from './pages/Media/MediaPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/generos" replace />} />
          <Route path="generos" element={<GenerosPage />} />
          <Route path="directores" element={<DirectoresPage />} />
          <Route path="productoras" element={<ProductorasPage />} />
          <Route path="tipos" element={<TiposPage />} />
          <Route path="media" element={<MediaPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
