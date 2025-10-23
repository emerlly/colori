import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Orders() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  });

  const { data: orders, isLoading, refetch } = trpc.orders.list.useQuery({});
  const createMutation = trpc.orders.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }

    try {
      const newOrder = await createMutation.mutateAsync({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        notes: formData.notes,
      });

      toast.success("Pedido criado com sucesso");
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        notes: "",
      });
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao criar pedido");
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      ready: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      processing: "Processando",
      ready: "Pronto",
      shipped: "Enviado",
      delivered: "Entregue",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <Link href="/dashboard">
              <a className="text-slate-600 hover:text-slate-900 mb-2">
                ← Voltar
              </a>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Pedidos</h1>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Pedido</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Nome do Cliente *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerName: e.target.value,
                      })
                    }
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerEmail: e.target.value,
                      })
                    }
                    placeholder="cliente@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">Telefone</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerPhone: e.target.value,
                      })
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Notas adicionais sobre o pedido"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Criar Pedido
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Carregando pedidos...</p>
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {order.orderNumber}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">Cliente</p>
                          <p className="font-medium text-slate-900">
                            {order.customerName}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Itens</p>
                          <p className="font-medium text-slate-900">
                            {order.itemCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Serviços</p>
                          <p className="font-medium text-slate-900">
                            {order.serviceCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Total</p>
                          <p className="font-bold text-green-600">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>

                      {order.customerEmail && (
                        <p className="text-xs text-slate-500 mt-2">
                          {order.customerEmail}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/orders/${order.id}`}>
                        <a>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Detalhes
                          </Button>
                        </a>
                      </Link>
                      <Link href={`/designer/${order.id}`}>
                        <a>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            3D
                          </Button>
                        </a>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum pedido criado</p>
              <p className="text-sm text-slate-500 mt-2">
                Clique em "Novo Pedido" para começar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

