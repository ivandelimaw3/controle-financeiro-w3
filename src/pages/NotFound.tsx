
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-6xl sm:text-8xl font-bold text-slate-800 mb-4">404</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto mb-6"></div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-700 mb-4">
          Página Não Encontrada
        </h2>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          Oops! A página que você está procurando não existe ou foi movida.
        </p>
        <div className="space-y-4">
          <a 
            href="/" 
            className="inline-block bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🏠 Voltar ao Início
          </a>
          <div className="text-sm text-slate-500">
            <p>Precisa de ajuda? Entre em contato conosco</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
