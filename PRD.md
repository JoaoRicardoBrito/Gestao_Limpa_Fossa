# PRD — Santa Clara ECO Admin Dashboard

**Versão:** 1.0
**Data:** 22 de abril de 2026
**Status:** Draft para aprovação

---

## 1. Contexto e Problema

A **Santa Clara ECO** opera desde 2011 em Teresina/PI e Timon/MA oferecendo serviços de limpeza de fossa, desentupimento, limpeza de caixa de gordura e hidrojateamento. Em 2026 foi lançado o site público (`Site_Limpa_Fossa`), que permite que clientes agendem serviços online através de um formulário que grava os dados no Supabase.

### Problema atual

Hoje, os agendamentos recebidos pelo site ficam armazenados **apenas no banco de dados Supabase**, sem interface de gestão. O fluxo operacional real é:

1. Cliente preenche formulário no site → registro gravado no Supabase
2. Email de notificação é enviado via EmailJS para o responsável
3. **A equipe não tem visibilidade consolidada** dos pedidos — depende de revisar emails um a um
4. Não há forma de marcar um agendamento como concluído, cancelar, adicionar observações ou consultar histórico
5. Não há visão agregada: quantos agendamentos por mês? Qual serviço mais vendido? Qual o tempo médio real de atendimento?

### Impacto

- **Risco de perder agendamentos** (email ignorado, spam, caixa cheia)
- **Decisões sem dados** — a equipe não sabe se o tempo médio anunciado no site (1h10min) condiz com a realidade
- **Sem rastreabilidade** — impossível auditar o que foi atendido vs. o que foi cancelado
- **Dados sensíveis de clientes (LGPD)** ficam apenas no banco, sem controle de acesso por usuário autenticado

---

## 2. Objetivo

Construir um **painel de gestão interno** (web app separado do site público) que permita à equipe administrativa da Santa Clara ECO:

1. Visualizar todos os agendamentos em tempo real
2. Separar pendentes, em andamento e concluídos
3. Agir sobre cada agendamento (marcar como concluído, cancelar, adicionar nota)
4. Analisar tendências através de um dashboard com gráficos
5. Controlar acesso através de login (email + senha) para proteger os dados dos clientes

### Não-objetivo (fora do escopo do MVP)

- App mobile nativo (a web responsiva atende)
- Integração com sistemas de faturamento/emissão de NF
- Gestão de funcionários/frota/rotas
- Chat com cliente
- Pagamentos online
- Relatórios avançados em PDF/CSV (fica para v1.1)

---

## 3. Personas

### Persona 1 — Maria, Gestora/Proprietária
- **Perfil:** 40 anos, administra a empresa há 10 anos
- **Habilidade técnica:** média — usa WhatsApp Business, planilhas simples
- **Dispositivo:** celular durante o dia, computador à noite
- **Dor principal:** perder agendamentos por não ver o email a tempo
- **Necessidade:** ver rapidamente o que está pendente e ter uma visão do mês

### Persona 2 — João, Operador de campo
- **Perfil:** 35 anos, motorista e operador do caminhão
- **Habilidade técnica:** baixa — usa principalmente o celular
- **Dispositivo:** celular 100%
- **Dor principal:** não sabe se o cliente confirmou, se o endereço está correto
- **Necessidade:** ver a agenda do dia e marcar serviço como concluído no local

> **Nota MVP:** todos os usuários terão o mesmo nível de acesso (admin). A separação por papéis fica para v2.

---

## 4. Requisitos Funcionais

### RF-01 — Autenticação obrigatória
- Toda a aplicação (exceto `/login`) exige usuário autenticado
- Login via **email + senha** usando Supabase Auth
- **Sem cadastro público** — novos usuários são criados manualmente pelo admin no painel do Supabase
- Logout acessível no cabeçalho
- Sessão persistida entre recarregamentos (gerenciada pelo SDK do Supabase)
- Redirecionamento automático para `/login` ao tentar acessar rota protegida sem sessão

### RF-02 — Lista de agendamentos
- Tela inicial após login exibe lista de agendamentos ordenada por `data_hora` ascendente
- Cada item exibe: nome, WhatsApp, endereço, serviço, data/hora agendada, status, data de criação
- **Tabs de status:** Pendentes | Em andamento | Concluídos | Cancelados | Todos
- Busca por nome ou WhatsApp
- Filtro por tipo de serviço
- Filtro por intervalo de datas

### RF-03 — Ações sobre agendamento
- Botão "Marcar em andamento" (status: pendente → em_andamento)
- Botão "Marcar concluído" (status: qualquer → concluido, grava `concluido_em`)
- Botão "Cancelar" (com confirmação e campo opcional de motivo)
- Botão "Abrir WhatsApp" — usa o link `wa.me` já implementado no site
- Botão "Adicionar nota" — campo de texto livre salvo no registro

### RF-04 — Dashboard com gráficos
- Cards de KPI: agendamentos do mês, pendentes agora, concluídos no mês, ticket médio
- Gráfico de barras: agendamentos por mês (últimos 6 meses)
- Gráfico de pizza/donut: distribuição por tipo de serviço
- Gráfico de linha: evolução de conclusões por semana
- Uso da mesma biblioteca `recharts` do site público para consistência visual

### RF-05 — Tempo real (stretch goal MVP)
- Subscription via Supabase Realtime — novos agendamentos aparecem na lista sem refresh
- Toast de notificação quando um novo agendamento chega

### RF-06 — Responsividade
- Layout mobile-first — operador em campo usa o celular
- Sidebar colapsável no desktop, hamburger/bottom-nav no mobile

---

## 5. Requisitos Não-Funcionais

### RNF-01 — Segurança / LGPD
- RLS (Row Level Security) ativa na tabela `appointments`
- Usuários anônimos podem apenas **inserir** (necessário para o site público funcionar)
- Apenas usuários autenticados podem **ler, atualizar e deletar**
- Senhas nunca trafegam em texto plano (Supabase Auth cuida disso)
- Sem exposição de chaves secretas no bundle — apenas `anon key` pública

### RNF-02 — Performance
- First Contentful Paint < 1.5s em 4G
- Bundle JS inicial < 200 KB gzipped
- Lazy-load de rotas pesadas (página de gráficos carrega sob demanda)

### RNF-03 — Stack alinhada com o site público
Para facilitar manutenção por quem já conhece o site atual:
- **React 18 + TypeScript** (idêntico)
- **Vite** como bundler (idêntico)
- **Tailwind CSS + shadcn/ui** (idêntico)
- **Supabase JS SDK** (idêntico — já está no site)
- **React Hook Form + Zod** para formulários
- **Recharts** para gráficos (idêntico)
- **Framer Motion** para transições (idêntico)
- **Lucide Icons** (idêntico)
- **React Router** (novo — site público é single-page, painel precisa de rotas)

### RNF-04 — Deploy
- **Vercel** (mesmo provedor do site público)
- Variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Domínio sugerido: `admin.santaclaraeco.com.br` (subdomínio separado do site público)

### RNF-05 — Acessibilidade
- Contraste mínimo WCAG AA
- Navegação por teclado funcional
- Labels em todos os campos de formulário

---

## 6. Mudanças no Banco de Dados

A tabela `appointments` atual precisa de colunas adicionais. A migration SQL está em `supabase/migrations/001_add_admin_fields.sql`:

```sql
ALTER TABLE appointments
  ADD COLUMN status text NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  ADD COLUMN concluido_em timestamptz,
  ADD COLUMN cancelado_em timestamptz,
  ADD COLUMN motivo_cancelamento text,
  ADD COLUMN notas text,
  ADD COLUMN valor numeric(10,2),
  ADD COLUMN atualizado_em timestamptz DEFAULT now();

CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_data_hora ON appointments(data_hora);
```

### Novas políticas RLS

```sql
-- Usuários autenticados podem ler tudo
CREATE POLICY "Authenticated users can read appointments"
  ON appointments FOR SELECT TO authenticated USING (true);

-- Usuários autenticados podem atualizar
CREATE POLICY "Authenticated users can update appointments"
  ON appointments FOR UPDATE TO authenticated USING (true);

-- Usuários autenticados podem deletar
CREATE POLICY "Authenticated users can delete appointments"
  ON appointments FOR DELETE TO authenticated USING (true);
```

> A política de INSERT para `anon` permanece — o site público precisa continuar funcionando sem login.

---

## 7. Arquitetura e Fluxos

### Fluxo de autenticação
```
/login → POST supabase.auth.signInWithPassword(email, password)
  ↓ sucesso
Guard de rota lê sessão → redireciona para /dashboard
  ↓ falha
Mensagem de erro inline no formulário
```

### Estrutura de rotas
```
/login              (pública — redireciona para /dashboard se já logado)
/                   (protegida — redireciona para /dashboard)
/dashboard          (protegida — KPIs + gráficos)
/agendamentos       (protegida — lista com filtros e tabs)
/agendamentos/:id   (protegida — detalhe com ações)
```

---

## 8. Métricas de Sucesso

### Primárias (30 dias após lançamento)
- **Adoção:** 100% dos agendamentos passam a ser gerenciados pelo painel (vs. email)
- **Zero perdas:** nenhum agendamento pendente > 24h sem ser visualizado
- **Uso diário:** Maria e João logam pelo menos 1x por dia

### Secundárias (90 dias)
- Redução de 30% no tempo médio de resposta a novos agendamentos
- Taxa de conclusão registrada ≥ 85% dos agendados
- Dashboard consultado ≥ 3x por semana pela gestora

---

## 9. Roadmap

### MVP (~3 semanas)
- [x] Setup do projeto e documentação
- [ ] Auth com Supabase (login/logout, guard de rota)
- [ ] Migration SQL com novas colunas + políticas RLS
- [ ] Lista de agendamentos com filtros e tabs
- [ ] Ações (concluir, cancelar, adicionar nota)
- [ ] Dashboard com KPIs e 3 gráficos essenciais
- [ ] Deploy Vercel + subdomínio
- [ ] Smoke tests manuais + treinamento da equipe

### v1.1
- [ ] Notificações em tempo real (Supabase Realtime)
- [ ] Exportação CSV
- [ ] Busca com debounce
- [ ] Paginação/infinite scroll
- [ ] Logout automático em inatividade

### v2 (backlog)
- [ ] Perfis admin vs operador (RLS por `auth.uid`)
- [ ] Campo "valor cobrado" e cálculo de receita
- [ ] Integração calendário (Google Calendar)
- [ ] Notificações push/email ao operador
- [ ] Relatórios PDF
- [ ] PWA instalável com cache offline

---

## 10. Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Equipe não adotar a ferramenta | Alto | Médio | Treinamento presencial + manter email como fallback nos primeiros 30 dias |
| Vazamento de credenciais | Alto | Baixo | RLS ativa, senhas fortes obrigatórias, logout automático em inatividade (v1.1) |
| Conexão instável em campo | Médio | Alto | PWA com cache offline (v2); no MVP, SDK do Supabase já lida com retry |
| Crescimento de dados degradar performance | Baixo | Baixo | Índices criados desde o início; paginação na v1.1 |

---

## 11. Critérios de Aceite do MVP

O MVP é considerado pronto quando:

- ✅ Usuário autenticado consegue ver a lista de agendamentos em pendentes/concluídos
- ✅ Usuário não autenticado é redirecionado para login e não consegue ler dados
- ✅ É possível marcar um agendamento como concluído e o status persiste
- ✅ Dashboard exibe ao menos 3 gráficos com dados reais
- ✅ App funciona em celular (375px) e desktop (1280px+)
- ✅ Deploy em produção acessível via HTTPS

---

## 12. Apêndice — Decisões técnicas

### Por que não Metabase?
O Metabase foi considerado mas descartado para o MVP porque:
- Exige um servidor separado rodando (custo e complexidade operacional)
- Interface genérica de BI não se adapta a workflows de ação (marcar concluído, cancelar)
- Equipe não técnica teria dificuldade com a UX de BI
- Recharts já cobre 100% das visualizações planejadas

O Metabase pode ser adicionado em v2 caso surjam análises complexas que exijam SQL ad-hoc.

### Por que não Next.js?
Mantemos Vite + React para consistência com o site público. Não há necessidade de SSR neste painel interno (SPA atende perfeitamente, e SEO é irrelevante para uma área logada).

### Por que email + senha e não Magic Link?
- Equipe sem familiaridade com "clicar em link do email" como método de login
- Magic link depende da caixa de email estar sempre acessível no dispositivo
- Email + senha é o padrão mental da equipe (como acessar um banco)
- Podemos adicionar 2FA em v2 se necessário
