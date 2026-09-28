// components/reclamos/ReclamoStatsCards.jsx
import React from "react";
import { FileText, Clock, RefreshCw, CheckCircle, XCircle, Ban } from "lucide-react";

const ESTADOS_STATS = [
  { key: "REGISTRADO",  label: "Registrados",  icon: Clock,         color: "amber" },
  { key: "EN_REVISION", label: "En revisión",  icon: RefreshCw,     color: "blue" },
  { key: "APROBADO",    label: "Aprobados",    icon: CheckCircle,   color: "emerald" },
  { key: "RECHAZADO",   label: "Rechazados",   icon: XCircle,       color: "red" },
  { key: "CANCELADO",   label: "Cancelados",   icon: Ban,           color: "gray" },
];

const COLOR_CLASSES = {
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",   icon: "text-amber-500" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-600",    icon: "text-blue-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-500" },
  red:     { bg: "bg-red-50",     text: "text-red-600",     icon: "text-red-500" },
  gray:    { bg: "bg-gray-50",    text: "text-gray-600",    icon: "text-gray-500" },
};

export default function ReclamoStatsCards({ reclamos }) {
  const total = reclamos.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-[#5b4eff]">{total}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          </div>
          <FileText size={24} className="text-[#5b4eff]/30" />
        </div>
      </div>

      {/* Por estado */}
      {ESTADOS_STATS.map(({ key, label, icon: Icon, color }) => {
        const count = reclamos.filter(r => r.estado === key).length;
        const styles = COLOR_CLASSES[color];
        return (
          <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${styles.text}`}>{count}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              </div>
              <div className={`w-8 h-8 ${styles.bg} rounded-lg flex items-center justify-center`}>
                <Icon size={16} className={styles.icon} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}