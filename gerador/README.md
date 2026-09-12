# Gerador de Fotos

Segundo site da campanha, no mesmo repositório. O apoiador escolhe uma foto do
aparelho, ajusta dentro da moldura da campanha e baixa a arte pronta.

```
gerador/
  netlify.toml        configuração do segundo site no Netlify
  dist/
    index.html        os três passos (foto, moldura, pronto)
    styles.css        identidade visual, igual à do site principal
    campanha.js       ÚNICO arquivo a editar para trocar de candidato
    app.js            motor de composição em canvas
    assets/favicon.svg
```

## Como funciona

Não existe arquivo de moldura em PNG. As artes são desenhadas no canvas do
navegador a partir dos tokens de `campanha.js`, o que traz três vantagens:

- a mesma moldura sai em 1080×1080, 1080×1440 e 1080×1920 sem perder nitidez;
- trocar cor, número, slogan ou nome é uma linha de configuração;
- a foto do apoiador nunca sai do aparelho, não há upload nem servidor.

O passo 2 permite arrastar a foto, dar zoom com os botões, com a roda do mouse
ou com dois dedos, e centralizar de novo. O passo 3 gera um PNG, oferece o
download e, nos celulares compatíveis, o compartilhamento pelo menu do sistema.

## Reaproveitar para outro candidato

1. Copie a pasta `gerador/` para o repositório do novo candidato.
2. Em `dist/campanha.js`, troque:
   - `candidato` (nome, sobrenome, número, cargo, região, assinatura, perfil, identificação legal);
   - `cores` com a paleta da campanha;
   - `arquivo`, que vira o nome do PNG baixado;
   - `molduras`, à vontade (pode ter duas, três ou seis).
3. Em `dist/index.html`, troque o cabeçalho, o rodapé, o título e as metatags.
   Se a campanha usar outras fontes, troque o `<link>` do Google Fonts e o bloco
   `fontes` de `campanha.js`.
4. Em `dist/styles.css`, ajuste as variáveis do `:root`.

### Anatomia de uma moldura

```js
{
  id: '01',                    // rótulo mostrado no seletor
  nome: 'MOVIMENTO',           // referência interna
  fundo: ['#0b5fe4', '#061f62'],   // degradê do fundo
  brilho: 'rgba(18,217,231,.32)',  // halo superior, ou null
  textura: 'pontos',           // pontos | anel | listras | nenhuma
  janela: 'circulo',           // circulo | arco | janela
  aro: 'rgba(255,255,255,.30)',    // anel em volta da foto
  tintaExtra: '#ffffff',       // textos de topo e rodapé nos formatos verticais
  selo: { texto, fundo, tinta, borda },
  placa: { fundo, cargoFundo, cargoTinta, nome, destaque,
           numeroFundo, numeroTinta, assinatura, risco }
}
```

A placa se dimensiona sozinha a partir do texto: nomes longos reduzem a fonte
em vez de estourar a arte.

## Rodar na máquina

Qualquer servidor estático apontando para `dist/`:

```bash
python -m http.server 4333 --directory gerador/dist
```

## Deploy

Ver `../DEPLOY.md`, seção "Gerador de fotos".
