# Bianca Leão 4447

Site institucional estático da candidatura de Bianca Leão a Deputada Federal por Minas Gerais.

**Stack:** HTML + CSS + JS puros. Sem build step, sem dependências, sem backend.

## Estrutura

```
netlify.toml          configuração de deploy (headers, cache, redirects, 404)
originais/            fotos e artes em resolução original (não publicadas)
tools/                scripts de apoio (imagens e auditoria)
dist/                 diretório publicado
├── index.html        página inicial
├── sobre.html        história de Bianca
├── pautas.html       pautas detalhadas
├── participe.html    formulário que abre o WhatsApp
├── figurinhas.html   downloads individuais e pacote completo
├── 404.html          página de erro
├── robots.txt        liberação para buscadores
├── sitemap.xml       mapa do site
├── styles.css        identidade visual e responsividade
├── script.js         animações, interações e SITE_CONFIG
├── analytics.js      carregador do Google Analytics 4 (GA_MEASUREMENT_ID)
└── assets/
    ├── fotos/        retratos e artes em WebP responsivo
    ├── figurinhas/   figurinhas e pacote .zip
    └── og-bianca-leao.jpg  imagem de compartilhamento
```

## Rodar localmente

Não precisa instalar nada. Abra `dist/index.html` com a extensão **Live Server** do VS Code, ou:

```bash
npx serve dist
```

## Configuração da campanha

Todo o que precisa ser preenchido está no topo de `dist/script.js`:

```js
const SITE_CONFIG = {
  whatsappNumber: '',     // 55 + DDD + número, só dígitos. Ex.: '5534999999999'
  whatsappGroupUrl: ''    // link chat.whatsapp.com do grupo oficial
};
```

- **`whatsappNumber` vazio:** o formulário ainda funciona — abre o WhatsApp com a mensagem
  pronta e deixa o visitante escolher o destinatário. Preencher é o comportamento desejado.
- **`whatsappGroupUrl` vazio:** o botão "Entrar no grupo" exibe um aviso de que o convite
  ainda será divulgado, em vez de quebrar.

## Imagens

As fotos publicadas são geradas a partir de `originais/`:

```bash
python tools/build-images.py
```

O script recorta o retrato das artes de campanha (removendo o texto sobreposto),
gera cada foto em WebP nas larguras usadas pelo `srcset` e monta a imagem de
compartilhamento 1200×630. Para trocar ou acrescentar fotos, coloque o arquivo em
`originais/`, ajuste a lista `RECORTES` no script e rode o comando de novo — nunca
edite os arquivos de `dist/assets/fotos/` à mão.

## Auditoria responsiva

`tools/auditoria-responsiva.html` abre as seis páginas em 11 larguras, de 320px
a 1920px, e verifica três coisas: se a página arrasta para o lado, se alguma
palavra parte ao meio dentro de um título e se algum bloco de texto ficou
espremido a ponto de não dar para ler.

```bash
npx serve dist                       # em um terminal
cp tools/auditoria-responsiva.html dist/
# abra http://localhost:3000/auditoria-responsiva.html
```

Rode sempre que mexer em tamanho de fonte, grid ou breakpoint. Ao terminar,
apague a cópia de `dist/` para não publicá-la.

## Analytics

O GA4 fica isolado em `dist/analytics.js`. Preencha `GA_MEASUREMENT_ID` com o ID da
property deste site (`G-XXXXXXXXXX`). Com o campo vazio, nenhum script de rastreio é
carregado e nenhum cookie é criado.

## Deploy

Ver [DEPLOY.md](DEPLOY.md).
