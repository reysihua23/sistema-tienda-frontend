// components/pagos/PayPalErrorBoundary.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

export default class PayPalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("PayPal Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <AlertCircle size={20} />
            <h3 className="font-bold">Error con PayPal</h3>
          </div>
          <p className="text-sm text-red-600">
            Hubo un problema al cargar PayPal. Por favor, recarga la página o intenta más tarde.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}