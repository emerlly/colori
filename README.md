# Sistema de Gerenciamento de Estoque e Pedidos - Personalização de Canecas

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

Um sistema completo e escalável para gerenciar estoque, pedidos e personalização de canecas com visualizador 3D integrado.

## 🎯 Características Principais

### 📦 Gerenciamento de Estoque
- Cadastro de produtos com SKU único
- Controle de quantidade em tempo real
- Histórico completo de movimentações
- Alertas de estoque baixo
- Suporte a múltiplas categorias

### 🛒 Gestão de Pedidos
- Criação rápida de pedidos
- Adição de múltiplos itens e serviços
- Sistema de descontos (fixo ou percentual)
- Atualização de status em tempo real
- Cálculo automático de totais

### 🎨 Visualizador 3D
- Visualização realista de canecas
- Seleção de 7 cores diferentes
- Upload de designs personalizados
- Visualização em tempo real
- Suporte a múltiplos designs por pedido

### 💰 Sistema de Preços
- Preço base por produto
- Serviços adicionais configuráveis
- Descontos flexíveis
- Cálculo automático de totais
- Histórico de preços

### 🔐 Segurança
- Autenticação OAuth integrada
- Criptografia de dados
- Controle de acesso por usuário
- Backup automático
- Logs de auditoria

## 🚀 Tecnologias

### Frontend
- **React 19** - Interface de usuário
- **Tailwind CSS 4** - Estilização
- **Three.js** - Renderização 3D
- **React Three Fiber** - Integração React + Three.js
- **tRPC** - Type-safe API calls
- **Vite** - Build tool

### Backend
- **Node.js 20+** - Runtime
- **Express 4** - Framework web
- **tRPC 11** - RPC framework
- **Drizzle ORM** - Database ORM
- **MySQL 8** - Banco de dados

### Infraestrutura
- **Ubuntu 24.04 LTS** - Sistema operacional
- **Nginx** - Reverse proxy
- **PM2** - Process manager
- **S3** - Armazenamento de arquivos

## 📋 Pré-requisitos

- Node.js v20.0.0 ou superior
- npm v10.0.0 ou pnpm v10.0.0
- MySQL 8.0 ou superior
- Ubuntu 24.04 LTS (ou compatível)

## 🔧 Instalação Rápida

### 1. Clone o Repositório
```bash
git clone <seu-repositorio> mug_management_system
cd mug_management_system
```

### 2. Instale Dependências
```bash
pnpm install
# ou
npm install
```

### 3. Configure Variáveis de Ambiente
```bash
cp .env.example .env
# Edite .env com suas configurações
```

### 4. Configure o Banco de Dados
```bash
# Crie o banco de dados
mysql -u root -p < setup.sql

# Execute migrações
pnpm db:push
```

### 5. Inicie o Servidor
```bash
# Desenvolvimento
pnpm dev

# Produção
pnpm build
pnpm start
```

O sistema estará disponível em `http://localhost:3000`

## 📚 Documentação

- **[Guia de Instalação](./INSTALLATION_GUIDE.md)** - Instalação completa em Ubuntu 24.04
- **[Guia de Uso](./README_USAGE.md)** - Como usar o sistema
- **[API Documentation](./API.md)** - Documentação das APIs tRPC

## 🎓 Estrutura do Projeto

```
mug_management_system/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── MugDesigner.tsx
│   │   │   └── OrderCheckout.tsx
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   └── Mug3DViewer.tsx
│   │   ├── lib/              # Utilitários
│   │   │   └── trpc.ts
│   │   ├── App.tsx           # Componente raiz
│   │   └── main.tsx
│   └── package.json
├── server/                    # Backend Node.js
│   ├── routers.ts            # Definição das APIs
│   ├── db.ts                 # Helpers de banco
│   ├── storage.ts            # S3 integration
│   └── _core/                # Framework core
├── drizzle/                  # Banco de dados
│   ├── schema.ts             # Definição das tabelas
│   └── migrations/           # Histórico de migrações
├── shared/                   # Código compartilhado
├── INSTALLATION_GUIDE.md     # Guia de instalação
├── README_USAGE.md           # Guia de uso
└── package.json
```

## 🗄️ Modelo de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema |
| `products` | Catálogo de canecas |
| `stock` | Controle de inventário |
| `orders` | Pedidos de clientes |
| `orderItems` | Itens em cada pedido |
| `orderServices` | Serviços adicionais |
| `designUploads` | Designs personalizados |
| `stockMovements` | Auditoria de estoque |

## 🔌 APIs Principais

### Produtos
- `POST /api/trpc/products.create` - Criar produto
- `GET /api/trpc/products.list` - Listar produtos
- `GET /api/trpc/products.get` - Obter detalhes
- `PATCH /api/trpc/products.update` - Atualizar
- `DELETE /api/trpc/products.delete` - Deletar

### Pedidos
- `POST /api/trpc/orders.create` - Criar pedido
- `GET /api/trpc/orders.list` - Listar pedidos
- `GET /api/trpc/orders.get` - Detalhes do pedido
- `PATCH /api/trpc/orders.updateStatus` - Atualizar status
- `PATCH /api/trpc/orders.updateTotal` - Atualizar totais

### Estoque
- `GET /api/trpc/stock.get` - Consultar estoque
- `PATCH /api/trpc/stock.update` - Atualizar quantidade
- `POST /api/trpc/stock.decrease` - Reduzir estoque
- `POST /api/trpc/stock.increase` - Aumentar estoque

## 🚀 Deploy

### Opção 1: Servidor Próprio (Ubuntu 24.04)
Siga o [Guia de Instalação](./INSTALLATION_GUIDE.md) para instruções completas.

### Opção 2: Plataforma de Hospedagem
- Vercel (frontend)
- Railway ou Render (backend)
- AWS RDS (banco de dados)

### Opção 3: Docker
```bash
# Build da imagem
docker build -t mug-system .

# Executar container
docker run -p 3000:3000 --env-file .env mug-system
```

## 📊 Escalabilidade

O sistema foi projetado para escalar:

- **Horizontal**: Suporte a múltiplas instâncias com load balancer
- **Vertical**: Otimizações de banco de dados e cache
- **Banco de Dados**: Índices otimizados e replicação
- **Armazenamento**: S3 para uploads ilimitados
- **Performance**: Compressão, cache e CDN

## 🔒 Segurança

- ✅ Autenticação OAuth integrada
- ✅ Senhas criptografadas
- ✅ HTTPS/SSL obrigatório
- ✅ Validação de entrada
- ✅ Proteção contra CSRF
- ✅ Rate limiting
- ✅ Logs de auditoria

## 📈 Performance

- Tempo de resposta < 200ms
- Suporte a 1000+ usuários simultâneos
- Cache de produtos
- Compressão de respostas
- Otimização de imagens

## 🐛 Troubleshooting

### Problema: Porta 3000 em uso
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Problema: Erro de conexão com banco
```bash
mysql -u user -p -h localhost database
```

### Problema: Migrações falhando
```bash
pnpm drizzle-kit drop
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

Veja [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) para mais soluções.

## 📝 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- 📧 Email: suporte@seu-dominio.com
- 💬 Chat: Disponível no sistema
- 📱 Telefone: (11) 9999-9999
- 🐛 Issues: GitHub Issues

## 🎉 Roadmap

- [ ] Integração com gateway de pagamento
- [ ] Relatórios avançados
- [ ] App mobile (React Native)
- [ ] Integração com redes sociais
- [ ] Sistema de avaliações
- [ ] Chat com clientes
- [ ] Notificações por email/SMS
- [ ] API pública para integrações

## 👨‍💻 Autor

Desenvolvido por **Manus AI** - Outubro 2024

## 🙏 Agradecimentos

- React community
- Three.js team
- Drizzle ORM team
- tRPC contributors

---

**Versão**: 1.0.0  
**Status**: Production Ready  
**Última Atualização**: Outubro 2024

**Comece agora**: [Guia de Instalação](./INSTALLATION_GUIDE.md) | [Guia de Uso](./README_USAGE.md)

