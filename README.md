# Santa Clara ECO — Admin Dashboard

Painel de gestão interno para a Santa Clara ECO (Teresina/PI). Permite à equipe visualizar, filtrar e agir sobre agendamentos recebidos pelo site público, com dashboard analítico completo e autenticação via Supabase.

---

## Funcionalidades

### Agendamentos
- Lista completa com tabs por status: Pendente, Em andamento, Concluído, Cancelado, Todos
- Busca por nome ou WhatsApp em tempo real
- Filtros por serviço, intervalo de datas
- Registro de notas internas por agendamento
- Botão direto para WhatsApp do cliente via `wa.me`

### Fluxo de Serviço
- **Iniciar:** seleciona caminhão + motorista obrigatoriamente antes de iniciar
- **Notificação automática:** após iniciar, oferece envio de mensagem WhatsApp ao motorista com nome do cliente, endereço, horário e link do Google Maps
- **Concluir:** registra valor cobrado e `concluido_em`
- **Cancelar:** campo opcional de motivo; grava `cancelado_em`
- Estados terminais (`concluído` / `cancelado`) bloqueados em duas camadas — UI e banco de dados

### Dashboard Analítico
- Filtro de período: **Semana / Mês / Semestre** — troca instantânea sem novo request
- **KPIs:** Total no período, Pendentes agora, Concluídos no período, Ticket Médio, Faturamento Total, Duração Média do Serviço
- **Gráfico de barras:** agendamentos por dia (semana) ou por mês (6 meses históricos)
- **Gráfico de pizza:** distribuição por tipo de serviço
- **Ranking de motoristas:** top 5 com mais serviços concluídos no período
- **Ranking de caminhões:** top 5 mais utilizados no período

### Cadastrar Cliente
- Registro de clientes que entram em contato fora do site (telefone, WhatsApp, presencial)
- Seleção de serviço padronizada (4 opções fixas = mesmas do site público)
- Validação de WhatsApp com regex + data e hora obrigatoriamente futura

### Caminhões (`/caminhoes`)
- Cadastro com placa e modelo
- Coluna **Serviços** com total de atendimentos concluídos
- Desativar / **Reativar** / **Apagar** (confirmação em dois cliques)

### Motoristas (`/motoristas`)
- Cadastro com nome e telefone
- Coluna **Serviços** com total de atendimentos concluídos
- Desativar motorista

### Métricas de Tempo
- Duração real de cada serviço calculada automaticamente: `concluido_em − em_andamento_em`
- Média exibida no dashboard por período selecionado

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Estilo | Tailwind CSS + shadcn/ui |
| Roteamento | React Router v6 |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Animações | Framer Motion |
| Ícones | Lucide React |
| Backend/Auth | Supabase (PostgreSQL + RLS) |
| Deploy | Vercel |

---

## Setup local

```bash
# 1. Clone o repositório
git clone <repo-url>
cd <repo-folder>

# 2. Instale dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
# Use SOMENTE a chave anon/public — JAMAIS a service_role key

# 4. Inicie em modo dev
npm run dev
```

Abra http://localhost:5173 no navegador.

---

## Banco de dados (Migrations)

As migrations estão em `supabase/migrations/`. Aplique-as em ordem no **Supabase Dashboard → SQL Editor**:

| Arquivo | O que faz |
|---------|-----------|
| `001_add_admin_fields.sql` | Adiciona campos de gestão à tabela `appointments` + RLS |
| `002_add_trucks.sql` | Cria tabela `trucks` + RLS |
| `003_add_service_duration.sql` | Coluna `em_andamento_em` para medir duração real dos serviços |
| `004_add_motoristas.sql` | Cria tabela `motoristas` + coluna `motorista_id` em appointments |
| `005_add_motorista_id_index.sql` | Índice de performance na FK `motorista_id` |

---

## Scripts

```bash
npm run dev       # dev server (Vite)
npm run build     # build de produção (tsc + vite build)
npm run preview   # preview do build local
npm run lint      # ESLint
npx vitest run    # testes unitários
npx vitest        # testes em modo watch
```

---

## Deploy (Vercel)

1. Conecte o repositório na Vercel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Push para `main` dispara deploy automático

Domínio: `admin.santaclaraeco.com.br`

---

## Segurança

- `service_role` key detectada e bloqueada em runtime — a app recusa iniciar se a chave errada for configurada
- RLS ativo: anônimos só podem INSERT (site público); autenticados podem ler e atualizar
- Estados terminais de agendamento bloqueados no banco via `.neq()` — não revertíveis mesmo por bypass de UI
- `.env` no `.gitignore` — credenciais nunca vão para o repositório
- Sem `dangerouslySetInnerHTML` — zero risco de XSS

---

## Estrutura do projeto

```
src/
├── components/
│   ├── appointments/   # Table, Card, Dialogs, StatusBadge, StatusSelect
│   ├── dashboard/      # KpiGrid, BarChartCard, DonutChartCard, RankingChartCard
│   ├── layout/         # Sidebar, MobileHeader, AppLayout, ProtectedRoute
│   └── ui/             # Componentes shadcn/ui
├── hooks/
│   ├── useAuth.tsx
│   ├── useAppointments.ts
│   ├── useDashboard.ts
│   ├── useMotoristas.ts
│   └── useTrucks.ts
├── pages/
│   ├── AppointmentsPage.tsx
│   ├── CadastrarClientePage.tsx
│   ├── DashboardPage.tsx
│   ├── MotoristasPage.tsx
│   └── TrucksPage.tsx
├── services/
│   ├── appointments.ts
│   ├── dashboard.ts
│   ├── motoristas.ts
│   ├── serviceCounts.ts  # cache TTL 5 min
│   └── trucks.ts
└── lib/
    ├── supabase.ts       # validação de env vars + guard service_role
    └── dateUtils.ts      # formatação sem conversão de fuso
```

---

## Licença

Projeto privado da Santa Clara ECO. Todos os direitos reservados.
