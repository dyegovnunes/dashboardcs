# Como rodar o dashboard localmente

## Pré-requisito
Node.js instalado (versão 18+). Baixe em https://nodejs.org se não tiver.

## Passos

```bash
# 1. Abra o terminal e navegue até a pasta do projeto
cd "C:\Users\Dyego\Documents\Claude\Time CS\Dashboard Lovable\csmaisa-main"

# 2. Instale as dependências (só precisa fazer uma vez)
npm install

# 3. Suba o servidor local
npm run dev
```

## Acessar
Após rodar `npm run dev`, abra no navegador: **http://localhost:8080**

O dashboard abre direto, sem tela de login.

## O que já funciona
- Visão Geral com ChurnTable, NPS, Atendimento e IES Cards
- Aba Atendimento com dados reais do Supabase (IAB, NS, Resolutividade, CSAT)
- Navegação por mês e toggle diário/mensal
- Filtro por IES (PUC PR, PUC Rio, etc.)
- Aba NPS e Jornada

## Próximas integrações planejadas
- ClickUp: to-dos e tarefas do time em tempo real
- Dados reais de Retenção e Evasão (substituir mockados)
- NPS real via CSV/Supabase
