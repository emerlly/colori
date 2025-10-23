# Guia de Instalação e Configuração - Sistema de Gerenciamento de Canecas

## Índice
1. [Requisitos do Sistema](#requisitos-do-sistema)
2. [Preparação do Ubuntu 24.04](#preparação-do-ubuntu-2404)
3. [Instalação do Projeto](#instalação-do-projeto)
4. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Execução do Sistema](#execução-do-sistema)
7. [Escalabilidade e Performance](#escalabilidade-e-performance)
8. [Troubleshooting](#troubleshooting)

---

## Requisitos do Sistema

### Hardware Mínimo
- **CPU**: 2 núcleos (recomendado 4+ para produção)
- **RAM**: 4 GB (recomendado 8 GB para produção)
- **Disco**: 20 GB de espaço livre
- **Conexão**: Internet para downloads de dependências

### Software Necessário
- **Ubuntu 24.04 LTS** (ou versão superior)
- **Node.js**: v20.0.0 ou superior
- **npm/pnpm**: v10.0.0 ou superior
- **MySQL**: v8.0 ou superior (ou MariaDB 10.5+)
- **Git**: v2.30.0 ou superior

---

## Preparação do Ubuntu 24.04

### 1. Atualizar o Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Dependências Base
```bash
sudo apt install -y \
  build-essential \
  curl \
  wget \
  git \
  openssl \
  libssl-dev \
  pkg-config \
  python3-dev
```

### 3. Instalar Node.js (via NodeSource)
```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 4. Instalar pnpm (Gerenciador de Pacotes Recomendado)
```bash
npm install -g pnpm

# Verificar instalação
pnpm --version
```

### 5. Instalar MySQL Server
```bash
# Instalar MySQL
sudo apt install -y mysql-server

# Iniciar o serviço
sudo systemctl start mysql
sudo systemctl enable mysql

# Verificar status
sudo systemctl status mysql
```

### 6. Configurar MySQL
```bash
# Executar script de segurança
sudo mysql_secure_installation

# Fazer login no MySQL
sudo mysql -u root -p

# Dentro do MySQL, criar banco de dados e usuário:
CREATE DATABASE mug_management;
CREATE USER 'mug_user'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON mug_management.* TO 'mug_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Instalação do Projeto

### 1. Clonar o Repositório
```bash
# Clone do repositório (ou extraia o arquivo)
git clone <seu-repositorio-url> mug_management_system
cd mug_management_system
```

### 2. Instalar Dependências do Projeto
```bash
# Instalar todas as dependências
pnpm install

# Ou, se preferir usar npm
npm install
```

### 3. Estrutura do Projeto
```
mug_management_system/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e configurações
│   │   └── App.tsx        # Componente raiz
│   └── package.json
├── server/                # Backend Node.js/Express
│   ├── routers.ts         # Definição das APIs tRPC
│   ├── db.ts              # Helpers de banco de dados
│   └── storage.ts         # Integração com S3
├── drizzle/               # Migrações e schema do banco
│   ├── schema.ts          # Definição das tabelas
│   └── migrations/        # Histórico de migrações
├── shared/                # Código compartilhado
└── package.json           # Dependências do projeto
```

---

## Configuração do Banco de Dados

### 1. Criar Arquivo de Variáveis de Ambiente
```bash
# Criar arquivo .env na raiz do projeto
cat > .env << 'EOF'
# Database
DATABASE_URL="mysql://mug_user:senha_segura_aqui@localhost:3306/mug_management"

# JWT e Autenticação
JWT_SECRET="sua_chave_secreta_muito_segura_aqui_minimo_32_caracteres"

# OAuth (Manus)
VITE_APP_ID="seu_app_id_aqui"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# Informações do Proprietário
OWNER_NAME="Seu Nome"
OWNER_OPEN_ID="seu_open_id"

# Branding
VITE_APP_TITLE="Sistema de Gerenciamento de Canecas"
VITE_APP_LOGO="https://seu-logo-url.com/logo.png"

# APIs Internas
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua_api_key_aqui"

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT="https://analytics.manus.im"
VITE_ANALYTICS_WEBSITE_ID="seu_website_id"
EOF
```

### 2. Executar Migrações do Banco de Dados
```bash
# Gerar migrações e aplicar ao banco
pnpm db:push

# Ou, manualmente:
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 3. Verificar Conexão com Banco
```bash
# Conectar ao MySQL e verificar tabelas
mysql -u mug_user -p mug_management

# Dentro do MySQL:
SHOW TABLES;
DESCRIBE products;
DESCRIBE orders;
EXIT;
```

---

## Variáveis de Ambiente

### Variáveis Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão MySQL | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | Chave para assinar JWTs | `sua_chave_secreta_minimo_32_caracteres` |
| `VITE_APP_ID` | ID da aplicação OAuth | `app_123456789` |
| `OAUTH_SERVER_URL` | URL do servidor OAuth | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login | `https://portal.manus.im` |

### Variáveis Recomendadas

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `VITE_APP_TITLE` | Título da aplicação | `Sistema de Gerenciamento de Canecas` |
| `VITE_APP_LOGO` | URL do logo | Vazio |
| `OWNER_NAME` | Nome do proprietário | Vazio |
| `OWNER_OPEN_ID` | ID do proprietário | Vazio |
| `BUILT_IN_FORGE_API_KEY` | Chave da API interna | Vazio |

### Variáveis Opcionais

| Variável | Descrição |
|----------|-----------|
| `VITE_ANALYTICS_ENDPOINT` | Endpoint de analytics |
| `VITE_ANALYTICS_WEBSITE_ID` | ID do website para analytics |
| `NODE_ENV` | Ambiente (development/production) |
| `PORT` | Porta do servidor (padrão: 3000) |

---

## Execução do Sistema

### 1. Modo Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# O servidor estará disponível em:
# http://localhost:3000
```

### 2. Build para Produção
```bash
# Compilar frontend e backend
pnpm build

# Iniciar servidor de produção
pnpm start
```

### 3. Executar com PM2 (Recomendado para Produção)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação com PM2
pm2 start "pnpm start" --name "mug-system"

# Salvar configuração
pm2 save

# Ativar inicialização automática
pm2 startup

# Verificar status
pm2 status
pm2 logs mug-system
```

### 4. Configurar Nginx como Reverse Proxy
```bash
# Instalar Nginx
sudo apt install -y nginx

# Criar configuração
sudo cat > /etc/nginx/sites-available/mug-system << 'EOF'
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Ativar site
sudo ln -s /etc/nginx/sites-available/mug-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. Configurar SSL com Let's Encrypt
```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo systemctl enable certbot.timer
```

---

## Escalabilidade e Performance

### 1. Otimizações de Banco de Dados

#### Criar Índices
```sql
-- Índices para melhor performance
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_stock_productId ON stock(productId);
CREATE INDEX idx_orders_userId ON orders(userId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_createdAt ON orders(createdAt DESC);
CREATE INDEX idx_orderItems_orderId ON orderItems(orderId);
CREATE INDEX idx_orderServices_orderId ON orderServices(orderId);
CREATE INDEX idx_stockMovements_productId ON stockMovements(productId);
```

#### Configurar Pool de Conexões
```bash
# Editar .env
DATABASE_URL="mysql://user:pass@localhost:3306/db?connectionLimit=20"
```

### 2. Escalabilidade Horizontal

#### Usar Load Balancer (HAProxy)
```bash
# Instalar HAProxy
sudo apt install -y haproxy

# Configurar múltiplas instâncias da aplicação
# Usar PM2 cluster mode
pm2 start "pnpm start" -i max --name "mug-system"
```

#### Replicação de Banco de Dados
```bash
# Configurar MySQL replication para alta disponibilidade
# Consultar documentação oficial do MySQL
```

### 3. Cache e Performance

#### Implementar Redis (Opcional)
```bash
# Instalar Redis
sudo apt install -y redis-server

# Ativar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### Compressão de Respostas
```bash
# Nginx já comprime por padrão
# Verificar em /etc/nginx/nginx.conf
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 4. Monitoramento e Logs

#### Configurar Logs com Logrotate
```bash
sudo cat > /etc/logrotate.d/mug-system << 'EOF'
/var/log/mug-system/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
EOF
```

#### Monitoramento com PM2 Plus
```bash
# Conectar ao PM2 Plus para monitoramento
pm2 link <secret_key> <public_key>
```

---

## Troubleshooting

### Problema: Erro de Conexão com Banco de Dados
```bash
# Verificar status do MySQL
sudo systemctl status mysql

# Verificar se a porta 3306 está aberta
sudo netstat -tlnp | grep 3306

# Testar conexão
mysql -u mug_user -p -h localhost mug_management
```

### Problema: Porta 3000 Já em Uso
```bash
# Encontrar processo usando a porta
sudo lsof -i :3000

# Matar processo
sudo kill -9 <PID>

# Ou usar porta diferente
PORT=3001 pnpm dev
```

### Problema: Erro de Permissão em Arquivos
```bash
# Corrigir permissões
sudo chown -R $USER:$USER /home/ubuntu/mug_management_system
chmod -R 755 /home/ubuntu/mug_management_system
```

### Problema: Migrações Falhando
```bash
# Limpar e refazer migrações
pnpm drizzle-kit drop
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Ou, verificar erros específicos
pnpm drizzle-kit migrate --verbose
```

### Problema: Memória Insuficiente
```bash
# Aumentar limite de memória do Node.js
NODE_OPTIONS="--max-old-space-size=4096" pnpm start

# Ou, adicionar swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Problema: Uploads de Arquivo Falhando
```bash
# Verificar limite de upload no Nginx
sudo nano /etc/nginx/nginx.conf

# Adicionar:
client_max_body_size 50M;

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## Backup e Recuperação

### Backup do Banco de Dados
```bash
# Backup completo
mysqldump -u mug_user -p mug_management > backup_$(date +%Y%m%d).sql

# Backup com compressão
mysqldump -u mug_user -p mug_management | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restaurar Banco de Dados
```bash
# Restaurar de arquivo
mysql -u mug_user -p mug_management < backup_20240101.sql

# Restaurar de arquivo comprimido
gunzip < backup_20240101.sql.gz | mysql -u mug_user -p mug_management
```

### Backup de Uploads (S3)
```bash
# Usar AWS CLI para backup
aws s3 sync s3://seu-bucket/uploads ./backups/uploads --profile seu-profile
```

---

## Suporte e Recursos

- **Documentação do Node.js**: https://nodejs.org/docs/
- **Documentação do Express**: https://expressjs.com/
- **Documentação do React**: https://react.dev/
- **Documentação do MySQL**: https://dev.mysql.com/doc/
- **Documentação do Drizzle ORM**: https://orm.drizzle.team/
- **Documentação do tRPC**: https://trpc.io/docs/

---

## Checklist de Produção

- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Banco de dados com backup automático
- [ ] SSL/TLS configurado
- [ ] Nginx como reverse proxy
- [ ] PM2 para gerenciamento de processos
- [ ] Logs configurados e monitorados
- [ ] Monitoramento de performance ativo
- [ ] Plano de escalabilidade definido
- [ ] Testes de carga realizados
- [ ] Documentação de operações atualizada

---

**Versão**: 1.0  
**Última Atualização**: Outubro 2024  
**Autor**: Emerlly Miranda

