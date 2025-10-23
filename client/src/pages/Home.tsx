import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            {APP_TITLE}
          </h1>
          <p className="text-blue-100 text-lg">
            Sistema completo de gerenciamento de estoque e pedidos
          </p>
        </div>

        <p className="text-blue-100 max-w-md">
          Gerencie sua loja de canecas personalizadas com facilidade. Controle
          de estoque, pedidos, serviços e visualização 3D de produtos.
        </p>

        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          size="lg"
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          Fazer Login
        </Button>
      </div>
    </div>
  );
}

