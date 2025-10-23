import { useState, useRef } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Download, AlertCircle } from "lucide-react";
import Mug3DViewer from "@/components/Mug3DViewer";
import { toast } from "sonner";

export default function MugDesigner() {
  const [, params] = useRoute("/designer/:id");
  const orderId = params?.id;

  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [designUrl, setDesignUrl] = useState<string>("");
  const [uploadedDesigns, setUploadedDesigns] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: order, isLoading } = trpc.orders.get.useQuery(
    { id: orderId || "" },
    { enabled: !!orderId }
  );

  const { data: designs, refetch: refetchDesigns } =
    trpc.designs.get.useQuery(
      { orderId: orderId || "" },
      { enabled: !!orderId }
    );

  const uploadMutation = trpc.designs.upload.useMutation();

  const mugColors = [
    { name: "Branco", value: "#ffffff" },
    { name: "Preto", value: "#000000" },
    { name: "Vermelho", value: "#ef4444" },
    { name: "Azul", value: "#3b82f6" },
    { name: "Verde", value: "#10b981" },
    { name: "Amarelo", value: "#fbbf24" },
    { name: "Cinza", value: "#9ca3af" },
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orderId) {
      toast.error("Selecione um arquivo e um pedido");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máximo 5MB)");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Tipo de arquivo inválido. Use JPG, PNG ou WebP");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const buffer = event.target?.result as ArrayBuffer;

        await uploadMutation.mutateAsync({
          orderId,
          fileName: file.name,
          fileData: Buffer.from(buffer),
          mimeType: file.type,
        });

        toast.success("Design enviado com sucesso");
        refetchDesigns();

        // Update preview
        const url = URL.createObjectURL(file);
        setDesignUrl(url);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast.error("Erro ao enviar design");
    }
  };

  const handleDownloadDesign = (design: any) => {
    const link = document.createElement("a");
    link.href = design.fileUrl;
    link.download = design.fileName;
    link.click();
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Nenhum pedido selecionado</p>
            <Link href="/orders">
              <a className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
                Voltar para Pedidos
              </a>
            </Link>
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href={`/orders/${orderId}`}>
            <a className="text-slate-600 hover:text-slate-900 mb-2">
              ← Voltar para Pedido
            </a>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            Visualizador 3D - {order.orderNumber}
          </h1>
          <p className="text-slate-600">
            Visualize e personalize sua caneca
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                <Mug3DViewer designUrl={designUrl} color={selectedColor} />
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Color Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cor da Caneca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {mugColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedColor === color.value
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      title={color.name}
                    >
                      <div
                        className="w-full h-8 rounded"
                        style={{ backgroundColor: color.value }}
                      />
                      <p className="text-xs text-slate-600 mt-1">
                        {color.name}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Design Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload de Design</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="design-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-900">
                        Clique para enviar
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        JPG, PNG ou WebP (máx 5MB)
                      </p>
                    </div>
                  </Label>
                  <input
                    id="design-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <p className="text-xs text-slate-500">
                  A imagem será exibida na caneca em tempo real
                </p>
              </CardContent>
            </Card>

            {/* Uploaded Designs */}
            {designs && designs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Designs Enviados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {designs.map((design) => (
                    <div
                      key={design.id}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {design.fileName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(design.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadDesign(design)}
                        className="ml-2 p-1 hover:bg-slate-200 rounded"
                        title="Baixar"
                      >
                        <Download className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dicas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-2">
                <p>
                  • Use imagens em alta resolução para melhor qualidade
                </p>
                <p>
                  • Formatos recomendados: PNG com fundo transparente
                </p>
                <p>
                  • Teste diferentes cores de caneca para encontrar a melhor
                  combinação
                </p>
                <p>
                  • Você pode enviar múltiplos designs para comparação
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

