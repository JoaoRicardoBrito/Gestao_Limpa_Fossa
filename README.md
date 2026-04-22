# Santa Clara ECO — Admin Dashboard

Painel de gestão interno para gerenciar os agendamentos recebidos pelo [site público da Santa Clara ECO](https://github.com/SEU_USUARIO/Site_Limpa_Fossa).

📄 Para o contexto completo do projeto, leia o [**PRD.md**](./PRD.md).

---

## 🚀 Stack

- **React 18** + **TypeScript**
- **Vite** como bundler
- **Tailwind CSS** + **shadcn/ui** para UI
- **Supabase** (banco + autenticação)
- **React Router** para rotas
- **React Hook Form** + **Zod** para formulários
- **Recharts** para gráficos
- **Framer Motion** para animações
- **Lucide Icons**

---

## 📋 Pré-requisitos

- Node.js 20+
- Uma conta no [Supabase](https://supabase.com) com o mesmo projeto usado pelo site público
- Acesso de admin ao projeto Supabase (para criar usuários manualmente)

---

## ⚙️ Setup local

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/santa-clara-admin.git
cd santa-clara-admin

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 4. Rode a migration no Supabase
# Abra o SQL Editor do Supabase e execute supabase/migrations/001_add_admin_fields.sql

# 5. Crie o primeiro usuário admin
# Supabase Dashboard → Authentication → Users → Add user
# (marque "Auto Confirm User" para não precisar verificar email)

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Abra `http://localhost:5173` no navegador.

---

## 🔐 Criando novos usuários

Por decisão de produto, **não há cadastro público**. Novos usuários devem ser criados manualmente:

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Abra seu projeto → **Authentication** → **Users**
3. Clique em **Add user** → **Create new user**
4. Preencha email, senha e marque **Auto Confirm User**
5. Envie as credenciais ao novo usuário por canal seguro

---

## 📦 Scripts disponíveis

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run preview   # Preview do build
npm run lint      # ESLint
```

---

## 🚢 Deploy na Vercel

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Deploy (na raiz do projeto)
vercel

# Configure as variáveis de ambiente no dashboard da Vercel:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

**Domínio recomendado:** `admin.santaclaraeco.com.br`

---

## 🗂️ Estrutura do projeto

```
santa-clara-admin/
├── public/                        # Arquivos estáticos
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── layout/                # Sidebar, Header, etc.
│   │   ├── dashboard/             # Cards de KPI, gráficos
│   │   └── appointments/          # Lista, detalhe, ações
│   ├── hooks/                     # useAuth, useAppointments, etc.
│   ├── lib/                       # supabase client, utils
│   ├── pages/                     # LoginPage, DashboardPage, etc.
│   ├── services/                  # appointments.ts, auth.ts
│   ├── types/                     # Tipos TypeScript
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   └── migrations/                # SQL migrations
├── .env.example
├── PRD.md                         # Product Requirements Document
└── README.md
```

---

## 🔒 Segurança

- **Nunca** commite o arquivo `.env.local`
- A chave `anon` do Supabase é pública por design — o que protege os dados é a **RLS (Row Level Security)**
- Todas as operações de leitura/escrita em `appointments` exigem usuário autenticado (ver migration)
- Dados dos clientes são PII sujeitos à LGPD — acesso restrito ao time operacional

---

## 📚 Documentação relacionada

- [PRD.md](./PRD.md) — Product Requirements Document completo
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Recharts](https://recharts.org)

---

## 📄 Licença

Projeto privado da Santa Clara ECO. Todos os direitos reservados.
