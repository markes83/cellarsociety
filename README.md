# 🍷 Clube de Vinhos

Loja online privada para clube de vinhos — React + Vite + Supabase.

---

## Stack técnica

- **Frontend**: React 18, React Router v6, Vite
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Estilos**: CSS puro com variáveis (sem framework)
- **Tipografia**: Cormorant Garamond + DM Sans

---

## Funcionalidades

| Área | Funcionalidade |
|------|----------------|
| Auth | Login email/password, sessão persistente, acesso só para membros |
| Loja | Catálogo com filtros por tipo e pesquisa, flag `visible` por produto |
| Carrinho | Adicionar/remover, checkout com morada de entrega |
| Encomendas | Histórico pessoal com detalhe expansível |
| Feed | Avaliações com nota (1–5), comentário, foto, likes |
| Admin | Gestão de produtos, estados de encomendas, papéis de membros |
| Perfil | Editar nome, ver papel e data de adesão |

---

## Instalação passo a passo

### 1. Instalar dependências

```bash
cd clube-vinhos
npm install
```

### 2. Criar projecto no Supabase

1. Criar conta gratuita em [supabase.com](https://supabase.com)
2. Criar novo projecto
3. Em **Project Settings → API**, copiar:
   - `Project URL`
   - `anon / public` key

### 3. Variáveis de ambiente

```bash
cp .env.example .env
```

Editar `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Criar a base de dados

1. Supabase → **SQL Editor**
2. Colar o conteúdo de `supabase_schema.sql`
3. Clicar **Run**

### 5. Criar o primeiro administrador

1. Supabase → **Authentication → Users → Add user**
2. No SQL Editor executar:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<uuid-do-utilizador>';
```

### 6. Iniciar

```bash
npm run dev
# Aceder a http://localhost:5173
```

### 7. Build de produção

```bash
npm run build
# Publicar a pasta dist/ em Netlify, Vercel ou Cloudflare Pages
```

---

## Estrutura de ficheiros

```
clube-vinhos/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Toast.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── LojaPage.jsx
│   │   ├── CarrinhoPage.jsx
│   │   ├── EncomendasPage.jsx
│   │   ├── FeedPage.jsx
│   │   ├── AdminPage.jsx
│   │   └── PerfilPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase_schema.sql
├── .env.example
├── package.json
├── vite.config.js
└── index.html
```

---

## Adicionar membros

Os membros não se registam sozinhos — o acesso é controlado pelo admin.

Para adicionar membro: Supabase → Authentication → Users → Add user.
O perfil é criado automaticamente pelo trigger.

---

## Segurança

- Toda a segurança é garantida por **Row Level Security** no Supabase
- A `anon key` é segura no frontend — as políticas RLS controlam o acesso
- O papel `admin` é gerido exclusivamente na tabela `profiles`
