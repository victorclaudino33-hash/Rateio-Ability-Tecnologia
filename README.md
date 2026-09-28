# Rateio de Custos — Ability (React + TypeScript)

## Como rodar no StackBlitz (sem instalar nada)

1. Acesse **https://stackblitz.com**
2. Clique em **"Start a new project" → "Upload a folder"**
3. Selecione a pasta `rateio-react` inteira
4. O StackBlitz instala as dependências automaticamente e abre o projeto
5. Você já vê o site rodando ao vivo no painel direito

## Como publicar na Vercel

### Opção A — Via GitHub (recomendada)
1. No StackBlitz, clique em **"Connect Repository"** → cria um repo no GitHub automaticamente
2. Na Vercel (vercel.com), clique **"Add New Project"** → importe o repositório
3. Configurações: Framework = **Vite**, Build Command = `npm run build`, Output = `dist`
4. Clique **Deploy** — pronto! A URL fica disponível em segundos
5. Toda vez que salvar no StackBlitz → GitHub → Vercel atualiza automaticamente

### Opção B — Upload direto na Vercel
1. Rode `npm run build` no StackBlitz (terminal integrado)
2. Baixe a pasta `dist/`
3. Arraste na Vercel em "Deploy from folder"

## Estrutura do projeto

```
rateio-react/
├── src/
│   ├── components/
│   │   └── UI.tsx          → botões, cards, tabelas, drawer (componentes reutilizáveis)
│   ├── hooks/
│   │   └── useFirestore.ts → salvar/listar/excluir rateios no Firebase
│   ├── lib/
│   │   ├── firebase.ts     → configuração do Firebase
│   │   ├── excel.ts        → leitura de .xlsx e exportação no modelo Ability
│   │   └── utils.ts        → formatação, verificações
│   ├── pages/
│   │   ├── Upload.tsx      → upload da planilha + cálculo de rateio
│   │   ├── Gerenciar.tsx   → selecionar centros, % e calcular
│   │   ├── Busca.tsx       → buscar colaborador por nome/matrícula
│   │   └── Historico.tsx   → histórico salvo no Firebase
│   ├── types/
│   │   └── index.ts        → interfaces TypeScript
│   ├── App.tsx             → navegação entre abas
│   ├── main.tsx            → entrada da aplicação
│   └── index.css           → Tailwind CSS
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

## Firebase — regras do Firestore

No console do Firebase → Firestore → Regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Stack

- **React 18** + **TypeScript** — componentes tipados
- **Tailwind CSS** — estilização sem CSS manual
- **Vite** — build rápido, compilado pela Vercel
- **Firebase Firestore** — histórico de rateios
- **XLSX.js** — leitura de planilhas e exportação no modelo Ability
- **Lucide React** — ícones
