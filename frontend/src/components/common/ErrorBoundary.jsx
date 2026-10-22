import React from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">error_outline</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Ocurrió un error inesperado</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              No pudimos cargar esta sección correctamente. Podés volver al inicio o al catálogo de vehículos mientras revisamos lo sucedido.
            </p>
            {this.state.error && (
              <div className="text-left bg-slate-100 p-3 rounded-lg text-[11px] font-mono text-slate-700 overflow-x-auto max-h-28">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
              >
                Reintentar
              </button>
              <a
                href="/catalogo"
                className="px-4 py-2.5 rounded-xl bg-secondary text-white font-bold text-xs hover:bg-secondary-container cursor-pointer transition-colors inline-block"
              >
                Ir al Catálogo
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
