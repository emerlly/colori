import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Package, ShoppingCart, BarChart3, Settings } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const menuItems = [
    {
      title: "Produtos",
      description: "Gerenciar catálogo de canecas",
      icon: Package,
      href: "/products",
      color: "bg-blue-500",
    },
    {
      title: "Pedidos",
      description: "Criar e gerenciar pedidos",
      icon: ShoppingCart,
      href: "/orders",
      color: "bg-green-500",
    },
    {
      title: "Estoque",
      description: "Controlar inventário",
      icon: BarChart3,
      href: "/stock",
      color: "bg-purple-500",
    },
    {
      title: "Configurações",
      description: "Ajustes do sistema",
      icon: Settings,
      href: "/settings",
      color: "bg-gray-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Sistema de Gerenciamento de Canecas
          </h1>
          <p className="text-slate-600 mt-1">
            Bem-vindo, {user?.name || "Usuário"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Resumo Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Produtos Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">--</div>
                <p className="text-xs text-slate-500 mt-1">
                  Carregando...
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Pedidos Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">--</div>
                <p className="text-xs text-slate-500 mt-1">
                  Carregando...
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Valor Total em Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">--</div>
                <p className="text-xs text-slate-500 mt-1">
                  Carregando...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

