import React from 'react';
import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <h2 className="text-xl font-bold text-slate-800">Cargando SIRS-SGAU...</h2>
      <p className="text-slate-500 text-sm mt-2">Por favor espera un momento</p>
    </div>
  );
}
