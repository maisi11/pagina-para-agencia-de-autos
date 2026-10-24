import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'

import HomePage from '../pages/public/HomePage'
import CatalogoPage from '../pages/public/CatalogoPage'
import DetallevehiculoPage from '../pages/public/DetallevehiculoPage'

import InventarioPage from '../pages/admin/InventarioPage'
import CrearPublicacionPage from '../pages/admin/CrearPublicacionPage'
import EditarPublicacionPage from '../pages/admin/EditarPublicacionPage'
import MetricasPage from '../pages/admin/MetricasPage'

import LoginPage from '../pages/auth/LoginPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Rutas Públicas (Compradores) envueltas en PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/vehiculo/:id" element={<DetallevehiculoPage />} />
      </Route>

      {/* Autenticación Vendedores */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Privadas (Vendedores / Backoffice) envueltas en AdminLayout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/inventario" replace />} />
        <Route path="inventario" element={<InventarioPage />} />
        <Route path="publicar" element={<CrearPublicacionPage />} />
        <Route path="editar/:id" element={<EditarPublicacionPage />} />
        <Route path="metricas" element={<MetricasPage />} />
      </Route>

      {/* Redirección por defecto si la ruta no existe */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
