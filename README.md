# Bianca Leão · Psicóloga

Site do consultório de Bianca Leão, psicóloga clínica (CRP 04/54365), em Patrocínio, MG.
Nasceu do site de campanha de 2026: a estrutura e os movimentos foram mantidos e o
conteúdo e a identidade visual foram refeitos para o consultório.

**Stack:** HTML + CSS + JS puros. Sem build step, sem dependências, sem backend.

## Estrutura

```
netlify.toml          deploy, headers, cache, atalhos e redirecionamentos da campanha
originais/            fotos em resolução original (não publicadas)
tools/                scripts de apoio (imagens e auditoria)
dist/                 diretório publicado
├── index.html        início: apresentação, temas, como funciona, onde atende, Instagram
├── sobre.html        história da Bianca
├── atendimento.html  modalidades, etapas do processo e dúvidas frequentes
├── agendar.html      formulário que abre o WhatsApp, consultório, mapa e contatos
├── 404.html          página de erro
├── styles.css        identidade visual e responsividade
├── script.js         interações e SITE_CONFIG
├── analytics.js      carregador do Google Analytics 4 (GA_MEASUREMENT_ID)
└── assets/
    ├── consultorio/  retratos recortados e fotos tratadas
    ├── fotos/        fotos de origem dos recortes da campanha
    ├── videos/       vídeos do Instagram (MP4 e WebM) e capas
    └── og-bianca-leao-psicologa.jpg  imagem de compartilhamento
```

## Rodar localmente

```bash
npx serve dist
```

## Configuração

Contato e endereço ficam no topo de `dist/script.js`:

```js
const SITE_CONFIG = {
  whatsappNumber: '5534997118991',      // 55 + DDD + número, só dígitos
  whatsappDisplay: '(34) 99711-8991',   // como aparece escrito
  instagram: 'psicologabiancaleao',
  city: 'Patrocínio, MG',
  address: ''                           // endereço completo do consultório
};
```

Com `address` vazio, o site mostra só a cidade, explica que o endereço vai na
confirmação do horário e centraliza o mapa em Patrocínio. Preenchido, o endereço
aparece em todas as páginas e o mapa e o botão "Como chegar" apontam para ele.

## Agendamento

O formulário de `agendar.html` não envia nada para servidor nenhum. Ao enviar, monta
uma mensagem com nome, WhatsApp, para quem é o atendimento, modalidade, dias, período
e se a pessoa já fez terapia, e abre o WhatsApp do consultório com ela pronta.
O campo de observação é opcional e o próprio formulário orienta a não contar detalhes
clínicos por ali.

Os botões "Saiba mais" dos temas abrem `agendar.html?tema=...`, e o tema escolhido
entra na mensagem.

## Identidade

| Token        | Cor       | Uso                                  |
|--------------|-----------|--------------------------------------|
| `--navy`     | `#223756` | textos, botões, faixas escuras        |
| `--blue`     | `#5c7c9c` | destaques em itálico, etiquetas       |
| `--mist`     | `#d7e2ec` | fundos claros azulados                |
| `--sand`     | `#ece3d5` | fundos quentes e sombras deslocadas    |
| `--paper`    | `#f8f5f0` | fundo base                            |

Fontes: Cormorant Garamond (títulos), Allura (manuscrita) e Manrope (texto).

## Imagens

As imagens de `dist/assets/consultorio/` saem das fotos da campanha e de posts do
Instagram (`originais/bianca-oculos.jpg` e `originais/bianca-lilas.jpg`), com o fundo,
as caixas de texto e o letreiro removidos:

```bash
pip install rembg onnxruntime scipy pillow
python tools/build-consultorio.py
```

O script recorta, apaga restos das cores da campanha e do letreiro, suaviza as bordas
cortadas e grava cada retrato em WebP com transparência nas larguras do `srcset`. As
entradas ficam nas listas `RECORTES` e `FOTOS_INTEIRAS`, no topo do arquivo.

## Vídeos

Os dois vídeos de `dist/assets/videos/` vieram do Instagram da Bianca:

| Arquivo                   | Onde aparece        | Assunto                                   |
|---------------------------|---------------------|-------------------------------------------|
| `bianca-apresentacao`     | Sobre, "Em vídeo"   | quem é a Bianca, karatê e psicologia      |
| `cansaco-ou-saturacao`    | Início, "Para pensar" | descanso, recuperação e a regra dos 10 minutos |

Cada vídeo tem MP4 (H.264, para Safari e a maioria dos navegadores), WebM (VP9, de
reserva) e uma capa `.webp`. A página só baixa o vídeo quando a pessoa toca no play.
Para trocar ou acrescentar um vídeo:

```bash
ffmpeg -i entrada.mp4 -vf "scale=540:-2,fps=30" -c:v libx264 -preset slower -crf 31 \
  -maxrate 700k -bufsize 1400k -pix_fmt yuv420p -c:a aac -b:a 80k -movflags +faststart nome.mp4
ffmpeg -i entrada.mp4 -vf "scale=540:-2,fps=30" -c:v libvpx-vp9 -crf 42 -b:v 480k \
  -maxrate 600k -row-mt 1 -c:a libopus -b:a 64k nome.webm
ffmpeg -ss 17.8 -i entrada.mp4 -frames:v 1 -vf scale=540:-2 nome.webp   # capa sem legenda
```

Quando houver fotos profissionais novas, o ideal é usá-las no lugar dos recortes.

## Auditoria responsiva

`tools/auditoria-responsiva.html` abre as páginas em 11 larguras, de 320px a 1920px.
Rode sempre que mexer em tamanho de fonte, grid ou breakpoint.

## Analytics

O GA4 fica isolado em `dist/analytics.js`. Com `GA_MEASUREMENT_ID` vazio, nenhum script
de rastreio é carregado e nenhum cookie é criado.

## Deploy

Ver [DEPLOY.md](DEPLOY.md).
