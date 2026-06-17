'use client';

import { useState, useEffect } from 'react';
// Si usas lucide-react para los iconos. Si usas otra librería, cambia este import.
import { Menu } from 'lucide-react'; 

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const date = new Date();
    
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayName = days[date.getDay()];
    const dayNumber = String(date.getDate()).padStart(2, '0');
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    
    // Formato exacto: Miércoles 03 de Junio de 2026
    setCurrentDate(`${dayName} ${dayNumber} de ${monthName} de ${year}`);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-4">
        {/* Botón hamburguesa estilo Divisist */}
        <button 
          onClick={toggleSidebar}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Alternar menú"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
          Panel de Control
        </h1>
      </div>
      <div className="text-xs text-gray-500 font-medium">
        {currentDate}
      </div>
    </header>
  );
}