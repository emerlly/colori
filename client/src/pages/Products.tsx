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
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Products() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: "",
    sku: "",
    category: "",
    initialStock: "",
  });

  const { data: products, isLoading, refetch } = trpc.products.list.useQuery({});
  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();
  const deleteMutation = trpc.products.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.basePrice || !formData.sku) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          description: formData.description,
          basePrice: parseInt(formData.basePrice),
          category: formData.category,
        });
        toast.success("Produto atualizado com sucesso");
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description,
          basePrice: parseInt(formData.basePrice),
          sku: formData.sku,
          category: formData.category,
          initialStock: formData.initialStock
            ? parseInt(formData.initialStock)
            : undefined,
        });
        toast.success("Produto criado com sucesso");
      }

      setFormData({
        name: "",
        description: "",
        basePrice: "",
        sku: "",
        category: "",
        initialStock: "",
      });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar produto");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este produto?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Produto deletado com sucesso");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar produto");
      }
    }
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      basePrice: (product.basePrice / 100).toString(),
      sku: product.sku,
      category: product.category || "",
      initialStock: product.stock?.toString() || "",
    });
    setEditingId(product.id);
    setIsOpen(true);
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
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
            <h1 className="text-3xl font-bold text-slate-900">Produtos</h1>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: "",
                    description: "",
                    basePrice: "",
                    sku: "",
                    category: "",
                    initialStock: "",
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Caneca Branca 300ml"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição do produto"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      placeholder="Ex: CAN-001"
                      disabled={!!editingId}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="Ex: Canecas"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="basePrice">Preço Base (R$) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, basePrice: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="initialStock">Estoque Inicial</Label>
                    <Input
                      id="initialStock"
                      type="number"
                      value={formData.initialStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          initialStock: e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Atualizar" : "Criar"} Produto
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
            <p className="text-slate-600">Carregando produtos...</p>
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-slate-600">SKU: {product.sku}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {product.description && (
                    <p className="text-sm text-slate-600">
                      {product.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-500">Preço</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatPrice(product.basePrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Estoque</p>
                      <p className="text-lg font-bold text-slate-900">
                        {product.stock}
                      </p>
                    </div>
                  </div>

                  {product.category && (
                    <p className="text-xs text-slate-500">
                      Categoria: {product.category}
                    </p>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Nenhum produto cadastrado</p>
              <p className="text-sm text-slate-500 mt-2">
                Clique em "Novo Produto" para começar
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

