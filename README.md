# taskflow-component

Conjunto de componentes e serviços Angular voltados a Gestão de Projetos (task flow, boards, timelines), preparado para uso como Micro Frontend (Module Federation) e integração em hosts Angular.

[![Angular](https://img.shields.io/badge/Angular-19-dd0031?logo=angular&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#licença)

## Sumário
- [Visão Geral](#visão-geral)
- [Requisitos](#requisitos)
- [Instalação e Setup](#instalação-e-setup)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Desenvolvimento (MFE Remote)](#desenvolvimento-mfe-remote)
- [Integração em Host Angular (Module Federation)](#integração-em-host-angular-module-federation)
- [Theming e Estilos (SCSS/Tailwind)](#theming-e-estilos-scsstailwind)
- [Testes e Qualidade](#testes-e-qualidade)
- [Versionamento e Commits](#versionamento-e-commits)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Visão Geral
Este repositório fornece:
- Componentes UI Angular reutilizáveis para gestão de tarefas e fluxos.
- Serviços e modelos para orquestração e integração com APIs.
- Configuração pronta para Micro Frontends via Module Federation, servindo o remote em http://localhost:4201.

## Requisitos
- Node.js: 18.19+ ou 20.11+ (recomendado LTS) ou 22+
- npm 9+ (ou pnpm/yarn; atenção ao script clean que usa pnpm)
- Angular CLI 19+
- Navegador Chrome/Chromium para testes (Karma)

## Instalação e Setup
Clone o repositório e instale as dependências:
```bash
git clone https://github.com/RTAcps/taskflow-component.git
cd taskflow-component

# Instalação com pnpm (padrão do projeto, necessário para o script "clean")
pnpm install
# ou, se preferir, npm 
npm install
```

## Scripts Disponíveis

- Desenvolvimento (serve na porta 4201):
  - `pnpm start` → `ng serve --port 4201`
  - `pnpm start:clean` → limpa caches locais e inicia em 4201
- Builds:
  - `pnpm build` → build padrão (dev)
  - `pnpm build:prod` → build com `--configuration production`
  - `pnpm watch` → build contínuo em desenvolvimento
- Testes:
  - `pnpm test` → `ng test`
- Limpeza:
  - `pnpm clean` → remove dist, caches, node_modules, limpa cache npm/ng e executa `pnpm install`
    - Observação: requer pnpm instalado globalmente ou use `npx pnpm install`
  - `pnpm clean:local` → remove dist e cache do Angular local

Dica: use `npm run ou pnpm` para listar todos os scripts disponíveis.

## Desenvolvimento (MFE Remote)
Suba o remote localmente:
```bash
pnpm start
# Servirá em: http://localhost:4201
```

O projeto utiliza:
- @angular-architects/module-federation (v19)
- ngx-build-plus (v19)

Se precisar reconfigurar o remote, utilize o schematic:
```bash
# Caso ainda não tenha configurado o Module Federation
ng add @angular-architects/module-federation --project taskflow-component --type remote --port 4201
```

Isso gera/atualiza arquivos como:
- module-federation.config.js (ou .ts)
- ajustes no angular.json para o builder de MF

## Integração em Host Angular (Module Federation)
No host Angular (CLI puro), adicione a referência ao remote.

1) Configuração do Host:
```js
// module-federation.config.js do HOST (exemplo)
module.exports = {
  remotes: {
    taskflow: 'taskflow@http://localhost:4201/remoteEntry.js',
  },
};
```

2) Rotas do Host (exemplo com utilitário loadRemoteModule):
```ts
// app.routes.ts do HOST
import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';

export const routes: Routes = [
  {
    path: 'taskflow',
    loadChildren: () =>
      loadRemoteModule({
        type: 'module',
        remoteEntry: 'http://localhost:4201/remoteEntry.js',
        exposedModule: './Module', // ajuste conforme exposições do remote
      }).then((m) => m.RemoteEntryModule),
    // Alternativamente, se expuser componente standalone:
    // loadComponent: () =>
    //   loadRemoteModule({
    //     type: 'module',
    //     remoteEntry: 'http://localhost:4201/remoteEntry.js',
    //     exposedModule: './TaskflowComponent',
    //   }).then((m) => m.TaskflowComponent),
  },
];
```

3) Exposições no Remote (exemplo genérico a ajustar):
```js
// module-federation.config.js do REMOTE
module.exports = {
  name: 'taskflow',
  exposes: {
    './Module': './src/app/remote-entry/remote-entry.module.ts',
    // ou para componente standalone:
    // './TaskflowComponent': './src/app/components/taskflow/taskflow.component.ts',
  },
  // shared: { ... }  // compartilhe @angular/*, rxjs, etc. conforme recomendado pelo schematic
};
```

Ajuste os caminhos acima conforme a estrutura real do seu src/.

## Theming e Estilos (SCSS/Tailwind)
O projeto inclui Tailwind CSS e SCSS.

- Dependências relevantes: tailwindcss 3.3.5, autoprefixer, postcss, @tailwindcss/forms.
- Passos típicos (confira seus arquivos):
  - tailwind.config.js com paths de templates (src/**/*.html, ts).
  - postcss.config.js habilitando tailwindcss e autoprefixer.
  - styles.css/scss incluindo diretivas:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```
  - Garanta que o arquivo de estilos global esteja referenciado em angular.json.

Tokens SCSS podem ser organizados em arquivos parciais e consumidos pelos componentes. Se o host oferecer tema, considere expor CSS variables para permitir override.

## Testes e Qualidade
- Testes: Jasmine + Karma
  ```bash
  npm test
  ```
- Cobertura (exemplo):
  ```bash
  ng test --code-coverage
  ```
- Lint/Format (se configurados em scripts):
  - ESLint e Prettier são recomendados. Adicione scripts como `lint` e `format` se necessário.

## Versionamento e Commits
- SemVer sugerido (MAJOR.MINOR.PATCH)
- Padrão de commits recomendado: Conventional Commits (feat:, fix:, chore:, refactor:, docs:)
- Publicação: este pacote está "private": true, logo o uso primário é como Remote MFE em hosts internos.

## Contribuição
1. Abra uma issue descrevendo bug/feature
2. Crie uma branch: `feat/nome-curto` ou `fix/nome-curto`
3. Siga Conventional Commits
4. Adicione/atualize testes e documentação
5. Abra um PR relacionando a issue

## Licença
MIT. Veja o arquivo LICENSE para detalhes.

---
Notas:
- O script `clean` usa pnpm. Instale pnpm (`npm i -g pnpm`) ou ajuste o script para usar npm/yarn conforme sua preferência.
- Porta padrão do remote: 4201. Ajuste conforme necessário no `ng serve` e no `remoteEntry` do host.
