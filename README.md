
# Santa Clara ECO — Admin Dashboard

Painel de gestão interno para a Santa Clara ECO (Teresina/PI). Permite à equipe visualizar, filtrar e agir sobre agendamentos recebidos pelo site público, com dashboard analítico e autenticação via Supabase.

Leia também o [PRD.md](./PRD.md) e o arquivo de contexto [CLAUDE.md](CLAUDE.md).

---

## 🚀 Stack principal

- React 18 + TypeScript
- Vite (bundler)
- Tailwind CSS + shadcn/ui
- Supabase (DB + Auth)
- React Router, React Hook Form, Zod
- Recharts, Framer Motion, Lucide

---

## 📋 Requisitos

- Node.js 20+
- Conta Supabase (use o MESMO projeto do site público)
- Acesso admin ao projeto Supabase para criar usuários

---

## ⚙️ Setup local (rápido)

```bash
# 1. Clone
git clone <repo-url>
cd <repo-folder>

# 2. Instale dependências
npm install

# 3. Copie variáveis de ambiente
cp env.example .env.local
# Edite .env.local com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# 4. Inicie em modo dev
npm run dev
```

Abra http://localhost:5173 no navegador.

Observações:
- Use o arquivo `env.example` para as variáveis necessárias (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
- Migrations SQL estão em [supabase/migrations](supabase/migrations). Execute-as manualmente no SQL Editor do Supabase quando necessário.

---

## 🔐 Gerenciamento de usuários

O painel não permite registro público. Crie usuários via Supabase Dashboard → Authentication → Users → Add user (marque Auto Confirm se desejar evitar verificação por e-mail).

---

## 🧪 Testes

O projeto inclui testes com `vitest` e utilitários do Testing Library em `src/test`.
Execute os testes com:

```bash
# via npx (não há script `test` no package.json)
npx vitest run

# ou em modo watch
npx vitest
```

---

## 📦 Scripts úteis (conforme `package.json`)

```bash
npm run dev       # inicia o dev server (vite)
npm run build     # compila TypeScript e faz build do Vite
npm run preview   # preview do build
npm run lint      # roda o ESLint
```

---

## 🚢 Deploy

Deploy recomendado: Vercel (domínio sugerido `admin.santaclaraeco.com.br`).
Configure no ambiente da Vercel as variáveis:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

---

## 🗂️ Estrutura relevante

Principais diretórios e arquivos:

- `src/components/appointments` — UI e ações relacionadas a agendamentos
- `src/components/dashboard` — cards e gráficos
- `src/hooks` — hooks reutilizáveis (`useAuth`, `useAppointments`, `useDashboard`)
- `src/services` — integração com Supabase (`auth.ts`, `appointments.ts`, `dashboard.ts`, `trucks.ts`)
- `src/lib/supabase.ts` — cliente Supabase central
- `supabase/migrations/` — migrations SQL usadas para adicionar campos/admin

---

## 🔒 Segurança & privacidade

- Nunca commit `env.local` ou chaves sensíveis.
- A chave `anon` do Supabase é pública por design; proteja dados com RLS.
- PII (dados pessoais) seguem LGPD — acesso restrito.

---

## ✅ Próximos passos sugeridos

- Adicionar um script `test` em `package.json` para facilitar execução dos testes (`"test": "vitest"`).
- Incluir instruções de migração automatizada (script CLI) se quiser aplicar migrations localmente.

---

## 📄 Licença

Projeto privado da Santa Clara ECO. Todos os direitos reservados.
