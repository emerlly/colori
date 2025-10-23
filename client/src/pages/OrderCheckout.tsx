import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function OrderCheckout() {
  const [, params] = useRoute("/checkout/:id");
  const orderId = params?.id;

  const [discountType, setDiscountType] = useState<"fixed" | "percentage">(
    "fixed"
  );
  const [discountValue, setDiscountValue] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { data: order, isLoading, refetch } = trpc.orders.get.useQuery(
    { id: orderId || "" },
    { enabled: !!orderId }
  );

  const updateTotalMutation = trpc.orders.updateTotal.useMutation();
  const decreaseStockMutation = trpc.stock.decrease.useMutation();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation();

  // Calculate totals
  const calculateTotals = () => {
    if (!order) return { itemsTotal: 0, servicesTotal: 0, subtotal: 0 };

    const itemsTotal = (order.items || []).reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    const servicesTotal = (order.services || []).reduce(
      (sum, svc) => sum + svc.price,
      0
    );
    const subtotal = itemsTotal + servicesTotal;

    return { itemsTotal, servicesTotal, subtotal };
  };

  const calculateDiscount = () => {
    const { subtotal } = calculateTotals();

    if (discountType === "fixed") {
      const discount = Math.min(
        Math.round(parseFloat(discountValue) * 100),
        subtotal
      );
      return { discount, percentage: 0 };
    } else {
      const percentage = Math.min(Math.max(parseInt(discountValue), 0), 100);
      const discount = Math.round((subtotal * percentage) / 100);
      return { discount, percentage };
    }
  };

  const { itemsTotal, servicesTotal, subtotal } = calculateTotals();
  const { discount, percentage } = calculateDiscount();
  const total = subtotal - discount;

  const handleApplyDiscount = async () => {
    if (!orderId) return;

    try {
      await updateTotalMutation.mutateAsync({
        id: orderId,
        subtotal,
        discount,
        discountPercentage: percentage,
      });

      toast.success("Desconto aplicado com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao aplicar desconto");
    }
  };

  const handleProcessOrder = async () => {
    if (!orderId || !order) return;

    setIsProcessing(true);

    try {
      // Decrease stock for each item
      for (const item of order.items || []) {
        await decreaseStockMutation.mutateAsync({
          productId: item.productId,
          quantity: item.quantity,
          orderId,
        });
      }

      // Update order status to processing
      await updateStatusMutation.mutateAsync({
        id: orderId,
        status: "processing",
      });

      // Update final totals
      await updateTotalMutation.mutateAsync({
        id: orderId,
        subtotal,
        discount,
        discountPercentage: percentage,
      });

      toast.success("Pedido processado com sucesso!");
      setIsCompleted(true);
      refetch();
    } catch (error) {
      toast.error("Erro ao processar pedido");
      setIsProcessing(false);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum pedido selecionado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Pedido Processado!
            </h2>
            <p className="text-slate-600 mb-4">
              O pedido {order.orderNumber} foi processado com sucesso.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-600">Total Cobrado</p>
              <p className="text-3xl font-bold text-green-600">
                {formatPrice(total)}
              </p>
            </div>
            <Link href="/orders">
              <a>
                <Button className="w-full">Voltar para Pedidos</Button>
              </a>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href={`/orders/${orderId}`}>
            <a className="text-slate-600 hover:text-slate-900 mb-2">
              ← Voltar para Pedido
            </a>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            Checkout - {order.orderNumber}
          </h1>
          <p className="text-slate-600">
            Cliente: {order.customerName}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            Produto: {item.productId}
                          </p>
                          <p className="text-sm text-slate-600">
                            {item.quantity}x {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                        <p className="font-bold text-slate-900">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 text-center py-4">
                    Nenhum item no pedido
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            {order.services && order.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {order.services.map((service) => (
                      <div
                        key={service.id}
                        className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {service.serviceName}
                          </p>
                          {service.description && (
                            <p className="text-sm text-slate-600">
                              {service.description}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-slate-900">
                          {formatPrice(service.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Discount */}
            <Card>
              <CardHeader>
                <CardTitle>Aplicar Desconto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setDiscountType("fixed")}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      discountType === "fixed"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-medium text-slate-900">Desconto Fixo</p>
                    <p className="text-sm text-slate-600">R$</p>
                  </button>
                  <button
                    onClick={() => setDiscountType("percentage")}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      discountType === "percentage"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-medium text-slate-900">Desconto %</p>
                    <p className="text-sm text-slate-600">Percentual</p>
                  </button>
                </div>

                <div>
                  <Label htmlFor="discountValue">
                    {discountType === "fixed"
                      ? "Valor do Desconto (R$)"
                      : "Percentual de Desconto (%)"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="discountValue"
                      type="number"
                      step={discountType === "fixed" ? "0.01" : "1"}
                      min="0"
                      max={discountType === "fixed" ? undefined : "100"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="0"
                    />
                    <Button
                      onClick={handleApplyDiscount}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>

                {discount > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Desconto aplicado: {formatPrice(discount)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Itens</span>
                    <span className="font-medium">
                      {formatPrice(itemsTotal)}
                    </span>
                  </div>
                  {servicesTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Serviços</span>
                      <span className="font-medium">
                        {formatPrice(servicesTotal)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>

                {discount > 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-800">Desconto</span>
                      <span className="font-bold text-green-800">
                        -{formatPrice(discount)}
                      </span>
                    </div>
                    {percentage > 0 && (
                      <p className="text-xs text-green-700 mt-1">
                        ({percentage}% de desconto)
                      </p>
                    )}
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-slate-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <Button
                    onClick={handleProcessOrder}
                    disabled={isProcessing || (order.items || []).length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? "Processando..." : "Confirmar Pedido"}
                  </Button>

                  {(order.items || []).length === 0 && (
                    <p className="text-xs text-slate-500 text-center mt-2">
                      Adicione itens ao pedido para confirmar
                    </p>
                  )}
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>✓ Estoque será baixado automaticamente</p>
                  <p>✓ Pedido será marcado como processando</p>
                  <p>✓ Confirmação será enviada ao cliente</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

