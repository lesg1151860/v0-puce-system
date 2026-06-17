import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-gray-200 py-3 mt-auto">
      <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-500">
        <div className="flex flex-col items-center gap-2">
          
          {/* Derechos de Autor - Centrado */}
          <div>
            &copy; {currentYear} Plataforma Unificada de Convivencia Escolar. Todos los derechos reservados.
          </div>
          
          <div className="flex items-center gap-1.5 justify-center">
            <span>Desarrollado por</span>
            <Image
              src="/images/ls-solutions-logo.png"
              alt="Logo de LS Solutions"
              width={24} // Logo mucho más pequeño
              height={24}
              className="object-contain"
            />
            <span className="font-semibold text-black tracking-wide">
              LS SOLUTIONS
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}