import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
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
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const orderId = params?.id;

  const [itemForm, setItemForm] = useState({
    productId: "",
    quantity: "",
    unitPrice: "",
  });

  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    description: "",
    price: "",
  });

  const [discountForm, setDiscountForm] = useState({
    discount: "",
    discountPercentage: "",
  });

  const [statusForm, setStatusForm] = useState("");

  const { data: order, isLoading, refetch } = trpc.orders.get.useQuery(
    { id: orderId || "" },
    { enabled: !!orderId }
  );

  const { data: products } = trpc.products.list.useQuery({});

  const addItemMutation = trpc.orderItems.add.useMutation();
  const removeItemMutation = trpc.orderItems.remove.useMutation();
  const addServiceMutation = trpc.orderServices.add.useMutation();
  const removeServiceMutation = trpc.orderServices.remove.useMutation();
  const updateTotalMutation = trpc.orders.updateTotal.useMutation();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();

  useEffect(() => {
    if (order) {
      setDiscountForm({
        discount: (order.discount / 100).toString(),
        discountPercentage: order.discountPercentage.toString(),
      });
      setStatusForm(order.status);
    }
  }, [order]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemForm.productId || !itemForm.quantity || !itemForm.unitPrice) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await addItemMutation.mutateAsync({
        orderId: orderId || "",
        productId: itemForm.productId,
        quantity: parseInt(itemForm.quantity),
        unitPrice: Math.round(parseFloat(itemForm.unitPrice) * 100),
      });

      toast.success("Item adicionado ao pedido");
      setItemForm({ productId: "", quantity: "", unitPrice: "" });
      refetch();
    } catch (error) {
      toast.error("Erro ao adicionar item");
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (confirm("Tem certeza que deseja remover este item?")) {
      try {
        await removeItemMutation.mutateAsync({
          id: itemId,
          orderId: orderId || "",
        });
        toast.success("Item removido");
        refetch();
      } catch (error) {
        toast.error("Erro ao remover item");
      }
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceForm.serviceName || !serviceForm.price) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      await addServiceMutation.mutateAsync({
        orderId: orderId || "",
        serviceName: serviceForm.serviceName,
        description: serviceForm.description,
        price: Math.round(parseFloat(serviceForm.price) * 100),
      });

      toast.success("Serviço adicionado ao pedido");
      setServiceForm({ serviceName: "", description: "", price: "" });
      refetch();
    } catch (error) {
      toast.error("Erro ao adicionar serviço");
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    if (confirm("Tem certeza que deseja remover este serviço?")) {
      try {
        await removeServiceMutation.mutateAsync({
          id: serviceId,
          orderId: orderId || "",
        });
        toast.success("Serviço removido");
        refetch();
      } catch (error) {
        toast.error("Erro ao remover serviço");
      }
    }
  };

  const handleUpdateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const discount = Math.round(parseFloat(discountForm.discount) * 100);
      const discountPercentage = parseInt(discountForm.discountPercentage);

      await updateTotalMutation.mutateAsync({
        id: orderId || "",
        subtotal: order?.subtotal || 0,
        discount,
        discountPercentage,
      });

      toast.success("Desconto atualizado");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar desconto");
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateStatusMutation.mutateAsync({
        id: orderId || "",
        status: statusForm as any,
      });

      toast.success("Status atualizado");
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Carregando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Pedido não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/orders">
            <a className="text-slate-600 hover:text-slate-900 mb-2">
              ← Voltar para Pedidos
            </a>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {order.orderNumber}
              </h1>
              <p className="text-slate-600">
                Cliente: {order.customerName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Status e Informações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateStatus} className="space-y-2">
                <Select value={statusForm} onValueChange={setStatusForm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="processing">Processando</SelectItem>
                    <SelectItem value="ready">Pronto</SelectItem>
                    <SelectItem value="shipped">Enviado</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm" className="w-full">
                  Atualizar
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Subtotal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">
                {formatPrice(order.subtotal)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(order.total)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Itens do Pedido */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Itens do Pedido</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Item ao Pedido</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <Label htmlFor="productId">Produto *</Label>
                    <Select
                      value={itemForm.productId}
                      onValueChange={(value) =>
                        setItemForm({ ...itemForm, productId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {formatPrice(product.basePrice)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantidade *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={itemForm.quantity}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, quantity: e.target.value })
                        }
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="unitPrice">Preço Unitário (R$) *</Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        step="0.01"
                        value={itemForm.unitPrice}
                        onChange={(e) =>
                          setItemForm({ ...itemForm, unitPrice: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Adicionar Item
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        Produto ID: {item.productId}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.quantity}x {formatPrice(item.unitPrice)} ={" "}
                        {formatPrice(item.subtotal)}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-4">
                Nenhum item adicionado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Serviços */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Serviços</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Serviço
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Serviço</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddService} className="space-y-4">
                  <div>
                    <Label htmlFor="serviceName">Nome do Serviço *</Label>
                    <Input
                      id="serviceName"
                      value={serviceForm.serviceName}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          serviceName: e.target.value,
                        })
                      }
                      placeholder="Ex: Personalização"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={serviceForm.description}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Descrição do serviço"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={serviceForm.price}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          price: e.target.value,
                        })
                      }
                      placeholder="0.00"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Adicionar Serviço
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {order.services && order.services.length > 0 ? (
              <div className="space-y-3">
                {order.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {service.serviceName}
                      </p>
                      {service.description && (
                        <p className="text-sm text-slate-600">
                          {service.description}
                        </p>
                      )}
                      <p className="text-sm font-medium text-slate-900">
                        {formatPrice(service.price)}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveService(service.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-center py-4">
                Nenhum serviço adicionado
              </p>
            )}
          </CardContent>
        </Card>

        {/* Desconto */}
        <Card>
          <CardHeader>
            <CardTitle>Desconto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateDiscount} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Desconto Fixo (R$)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    value={discountForm.discount}
                    onChange={(e) =>
                      setDiscountForm({
                        ...discountForm,
                        discount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="discountPercentage">Desconto (%)</Label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={discountForm.discountPercentage}
                    onChange={(e) =>
                      setDiscountForm({
                        ...discountForm,
                        discountPercentage: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Atualizar Desconto
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

