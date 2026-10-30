# Vale Verde — Minha Fazenda

Jogo de fazenda isométrico desenvolvido com **Phaser 3**, **TypeScript** e **Vite**. O código é modular e o progresso é salvo localmente no navegador.

## Requisitos
- Node.js 20 ou superior
- npm

## Instalação e execução
Abra o terminal dentro da pasta do projeto e execute:

```bash
npm install
npm run dev
```

Abra o endereço local indicado pelo Vite, normalmente `http://127.0.0.1:5173`.

A instalação inicial das dependências requer internet. Depois de instaladas, o jogo pode ser executado offline no computador.

## Build de distribuição

```bash
npm run build
npm run preview
```

Os arquivos finais ficam em `dist/`. Use o servidor `preview` para abrir o build localmente; não abra arquivos TypeScript diretamente no navegador.

## Controles
- WASD ou setas: movimentar o personagem
- Clique no mapa: caminhar até o local
- Arar: preparar canteiros
- Plantar: usar sementes do inventário
- Regar: acelerar crescimento
- Colher: recolher plantações maduras
- Loja: comprar sementes
- Celeiro: vender colheitas

## Salvamento
O progresso é guardado no `localStorage` do navegador. Use o mesmo perfil de navegador e não limpe os dados do site para preservar a fazenda.

O cenário e o personagem iniciais são desenhados com gráficos vetoriais próprios. Novas funcionalidades e recursos gráficos serão desenvolvidos em módulos separados.
