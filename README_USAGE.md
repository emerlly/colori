# Sistema de Gerenciamento de Estoque e Pedidos - Guia de Uso

## Visão Geral

O **Sistema de Gerenciamento de Estoque e Pedidos** é uma plataforma completa para empresas de personalização de canecas. O sistema oferece controle total de inventário, gestão de pedidos, visualização 3D de produtos e cálculo automático de preços com descontos.

---

## Funcionalidades Principais

### 1. Gerenciamento de Produtos

#### Criar Novo Produto
1. Acesse **Produtos** no menu principal
2. Clique em **Novo Produto**
3. Preencha os campos:
   - **Nome**: Nome da caneca (ex: "Caneca Branca 300ml")
   - **SKU**: Código único do produto (ex: "CAN-001")
   - **Descrição**: Detalhes do produto
   - **Categoria**: Classificação (ex: "Canecas")
   - **Preço Base**: Valor em reais (ex: 15.90)
   - **Estoque Inicial**: Quantidade inicial (ex: 100)
4. Clique em **Criar Produto**

#### Editar Produto
1. Na lista de produtos, clique em **Editar** no produto desejado
2. Modifique os campos necessários
3. Clique em **Atualizar Produto**

#### Deletar Produto
1. Na lista de produtos, clique em **Deletar** no produto desejado
2. Confirme a exclusão

### 2. Controle de Estoque

#### Visualizar Estoque
1. Acesse **Estoque** no menu principal
2. Veja a quantidade disponível de cada produto
3. Produtos com estoque baixo aparecem destacados

#### Ajustar Estoque Manualmente
1. Acesse **Estoque**
2. Clique em **Ajustar** no produto desejado
3. Informe a nova quantidade
4. Clique em **Atualizar**

#### Histórico de Movimentações
1. Acesse **Estoque**
2. Clique em **Histórico** para ver todas as movimentações
3. Cada venda, ajuste e devolução é registrado

### 3. Gestão de Pedidos

#### Criar Novo Pedido
1. Acesse **Pedidos** no menu principal
2. Clique em **Novo Pedido**
3. Preencha os dados do cliente:
   - **Nome**: Nome completo
   - **Email**: Email para contato
   - **Telefone**: Número de telefone
   - **Observações**: Notas adicionais
4. Clique em **Criar Pedido**

#### Adicionar Itens ao Pedido
1. Abra o pedido (clique em **Detalhes**)
2. Clique em **Adicionar Item**
3. Selecione o produto
4. Informe a quantidade e preço unitário
5. Clique em **Adicionar Item**

#### Adicionar Serviços
1. Na página do pedido, clique em **Adicionar Serviço**
2. Preencha:
   - **Nome do Serviço**: Ex: "Personalização"
   - **Descrição**: Detalhes do serviço
   - **Preço**: Valor do serviço
3. Clique em **Adicionar Serviço**

#### Aplicar Desconto
1. Na página do pedido, acesse a seção **Desconto**
2. Escolha o tipo:
   - **Desconto Fixo**: Valor em reais
   - **Desconto Percentual**: Percentual (0-100%)
3. Informe o valor
4. Clique em **Atualizar Desconto**

#### Atualizar Status do Pedido
1. Na página do pedido, clique em **Status**
2. Selecione o novo status:
   - **Pendente**: Pedido recém-criado
   - **Processando**: Pedido em processamento
   - **Pronto**: Pedido pronto para envio
   - **Enviado**: Pedido despachado
   - **Entregue**: Pedido entregue ao cliente
   - **Cancelado**: Pedido cancelado
3. Clique em **Atualizar**

### 4. Visualizador 3D de Caneca

#### Acessar Visualizador
1. Na lista de pedidos, clique em **3D** no pedido desejado
2. Ou, abra o pedido e clique em **Visualizador 3D**

#### Selecionar Cor da Caneca
1. No visualizador, clique em uma das cores disponíveis:
   - Branco
   - Preto
   - Vermelho
   - Azul
   - Verde
   - Amarelo
   - Cinza
2. A caneca é atualizada em tempo real

#### Enviar Design
1. Clique em **Clique para enviar** na seção de upload
2. Selecione uma imagem (JPG, PNG ou WebP)
3. Máximo 5MB por arquivo
4. O design aparece na caneca automaticamente

#### Gerenciar Designs
1. Todos os designs enviados aparecem em **Designs Enviados**
2. Clique no ícone de download para salvar um design
3. Você pode enviar múltiplos designs para comparação

### 5. Checkout e Processamento

#### Acessar Checkout
1. Na página do pedido, clique em **Checkout**
2. Ou acesse `/checkout/:id` diretamente

#### Revisar Resumo
1. Verifique todos os itens e serviços
2. Confirme o subtotal
3. Revise descontos aplicados

#### Aplicar Desconto Final
1. Escolha tipo de desconto (fixo ou percentual)
2. Informe o valor
3. Clique em **Aplicar**

#### Confirmar Pedido
1. Revise o total final
2. Clique em **Confirmar Pedido**
3. O sistema automaticamente:
   - Baixa o estoque de cada item
   - Atualiza o status para "Processando"
   - Registra todas as movimentações
4. Você verá uma confirmação de sucesso

---

## Fluxo Completo de Um Pedido

### Exemplo Prático: Pedido de 10 Canecas Personalizadas

**Passo 1: Criar Pedido**
- Acesse Pedidos → Novo Pedido
- Nome: "João Silva"
- Email: "joao@email.com"
- Clique em Criar

**Passo 2: Adicionar Itens**
- Clique em Detalhes do pedido
- Adicionar Item:
  - Produto: "Caneca Branca 300ml"
  - Quantidade: 10
  - Preço Unitário: R$ 15,90
- Total do item: R$ 159,00

**Passo 3: Adicionar Serviço**
- Clique em Adicionar Serviço
- Nome: "Personalização com Logo"
- Preço: R$ 50,00
- Subtotal: R$ 209,00

**Passo 4: Visualizar em 3D**
- Clique em 3D
- Selecione cor: Branco
- Envie o logo do cliente
- Visualize como ficará

**Passo 5: Aplicar Desconto**
- Retorne ao pedido
- Desconto: 10% (R$ 20,90)
- Novo total: R$ 188,10

**Passo 6: Checkout**
- Clique em Checkout
- Revise todos os dados
- Clique em Confirmar Pedido
- Estoque é baixado automaticamente
- Pedido marcado como "Processando"

**Passo 7: Acompanhamento**
- Atualize status conforme o pedido progride
- Pendente → Processando → Pronto → Enviado → Entregue

---

## Dicas e Boas Práticas

### Gestão de Estoque
- **Revise regularmente**: Verifique o estoque diariamente
- **Alertas**: Produtos com estoque baixo são destacados
- **Histórico**: Mantenha registro de todas as movimentações
- **Previsão**: Planeje compras baseado em histórico de vendas

### Gestão de Pedidos
- **Organização**: Use observações para notas importantes
- **Status**: Atualize sempre o status do pedido
- **Comunicação**: Informe ao cliente sobre atualizações
- **Backup**: Faça backup regular dos pedidos

### Preços e Descontos
- **Preço Base**: Defina preços competitivos
- **Serviços**: Adicione margem para personalização
- **Descontos**: Use para promoções estratégicas
- **Cálculo**: O sistema calcula automaticamente

### Visualizador 3D
- **Cores**: Teste diferentes cores para melhor apresentação
- **Designs**: Use imagens em alta resolução
- **PNG**: Prefira PNG com fundo transparente
- **Proporção**: Designs quadrados funcionam melhor

---

## Relatórios e Análises

### Produtos Mais Vendidos
1. Acesse **Dashboard**
2. Veja estatísticas de produtos
3. Identifique tendências

### Faturamento
1. Acesse **Pedidos**
2. Filtre por período
3. Calcule faturamento total

### Estoque
1. Acesse **Estoque**
2. Veja quantidade disponível
3. Identifique produtos com baixo estoque

---

## Segurança e Privacidade

### Autenticação
- Login seguro via OAuth
- Sessões com expiração automática
- Senhas nunca são armazenadas

### Dados
- Todos os dados são criptografados
- Backup automático do banco de dados
- Acesso restrito por usuário

### Uploads
- Validação de tipo de arquivo
- Limite de tamanho (5MB)
- Armazenamento seguro em S3

---

## Suporte e Ajuda

### Problemas Comuns

**P: Não consigo fazer login**
- Verifique sua conexão com internet
- Limpe cache do navegador
- Tente outro navegador

**P: Estoque não está atualizando**
- Atualize a página (F5)
- Verifique se há itens no pedido
- Confirme o pedido no checkout

**P: Design não aparece na caneca**
- Verifique o formato (JPG, PNG, WebP)
- Confirme tamanho (máx 5MB)
- Tente outra imagem

**P: Desconto não está sendo aplicado**
- Verifique se o valor é menor que o subtotal
- Escolha o tipo correto (fixo ou percentual)
- Clique em Aplicar

---

## Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl + N` | Novo Pedido |
| `Ctrl + S` | Salvar/Atualizar |
| `Ctrl + Q` | Logout |
| `Esc` | Fechar modal |

---

## Contato e Feedback

Para dúvidas, sugestões ou reportar problemas:
- Email: suporte@seu-dominio.com
- Telefone: (11) 9999-9999
- Chat: Disponível no sistema

---

**Versão**: 1.0  
**Última Atualização**: Outubro 2024  
**Autor**: Manus AI

