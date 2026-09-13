/* ==================================================================
   GERADOR DE FOTOS - CONFIGURACAO DA CAMPANHA
   ------------------------------------------------------------------
   Este e o UNICO arquivo que muda de um candidato para outro.
   O motor (gerador.js) desenha tudo a partir daqui: nao existe nenhuma
   imagem de moldura para produzir, as artes sao geradas no navegador
   em alta resolucao a partir destes tokens.

   Para reaproveitar em outra campanha:
   1. troque o bloco `candidato`;
   2. troque a paleta em `cores`;
   3. ajuste as `molduras` (pode ter quantas quiser);
   4. troque a fonte no <head> do gerador.html se a campanha usar outra.
================================================================== */

window.GERADOR_CAMPANHA = {

  /* --- Identificacao ------------------------------------------- */
  candidato: {
    nome: 'BIANCA',
    sobrenome: 'LEÃO',
    numero: '4447',
    cargo: 'CANDIDATA A DEPUTADA FEDERAL',
    regiao: 'MINAS GERAIS',
    assinatura: 'de pertinho, por Minas',
    instagram: 'biancanleao',
    site: 'https://biancaleao.achillesmedia.com.br',
    legal: 'FEDERAÇÃO PARTIDÁRIA UNIÃO PROGRESSISTA — UNIÃO BRASIL · CNPJ 68.468.267/0001-41'
  },

  /* Prefixo do arquivo baixado: bianca-leao-4447-quadrado.png */
  arquivo: 'bianca-leao-4447',

  /* --- Paleta --------------------------------------------------- */
  cores: {
    azul: '#0756d9',
    azulEscuro: '#083094',
    azulProfundo: '#061f62',
    ciano: '#12d9e7',
    amarelo: '#ffdf10',
    tinta: '#06142e',
    branco: '#ffffff'
  },

  /* --- Fontes usadas no canvas ---------------------------------- */
  fontes: {
    display: '"Archivo Black", Impact, sans-serif',
    corpo: 'Manrope, Arial, sans-serif',
    script: 'Caveat, cursive'
  },

  /* --- Formatos de saida ---------------------------------------- */
  formatos: [
    { id: 'quadrado', nome: 'QUADRADO', medida: '1080 × 1080', largura: 1080, altura: 1080 },
    { id: 'feed',     nome: 'FEED',     medida: '1080 × 1440', largura: 1080, altura: 1440 },
    { id: 'story',    nome: 'STORY',    medida: '1080 × 1920', largura: 1080, altura: 1920 }
  ],

  /* --- Molduras -------------------------------------------------
     fundo      : duas cores do degrade
     brilho     : halo superior (use null para desligar)
     textura    : 'pontos' | 'anel' | 'listras' | 'nenhuma'
     janela     : 'circulo' | 'arco' | 'janela'
     aro        : cor do anel em volta da foto
     selo       : etiqueta adesiva sobre a foto
     placa      : assinatura visual da campanha
  --------------------------------------------------------------- */
  molduras: [
    {
      id: '01',
      nome: 'MOVIMENTO',
      fundo: ['#0b5fe4', '#061f62'],
      brilho: 'rgba(18,217,231,.32)',
      textura: 'pontos',
      janela: 'circulo',
      aro: 'rgba(255,255,255,.30)',
      tintaExtra: '#ffffff',
      selo: { texto: 'EU TÔ COM A BIANCA', fundo: '#ffdf10', tinta: '#061f62', borda: '#ffffff' },
      placa: {
        fundo: '#ffffff',
        cargoFundo: '#0756d9', cargoTinta: '#ffffff',
        nome: '#061f62', destaque: '#0756d9',
        numeroFundo: '#ffdf10', numeroTinta: '#061f62',
        assinatura: '#0756d9', risco: '#12d9e7'
      }
    },
    {
      id: '02',
      nome: 'ENERGIA',
      fundo: ['#ffe64a', '#ffc400'],
      brilho: 'rgba(255,255,255,.45)',
      textura: 'anel',
      janela: 'circulo',
      aro: 'rgba(6,31,98,.22)',
      tintaExtra: '#061f62',
      selo: { texto: 'CUIDAR É FAZER', fundo: '#061f62', tinta: '#ffdf10', borda: '#ffffff' },
      placa: {
        fundo: '#ffffff',
        cargoFundo: '#061f62', cargoTinta: '#ffdf10',
        nome: '#061f62', destaque: '#0756d9',
        numeroFundo: '#0756d9', numeroTinta: '#ffdf10',
        assinatura: '#0756d9', risco: '#ffdf10'
      }
    },
    {
      id: '03',
      nome: 'PERTO',
      fundo: ['#12d9e7', '#0756d9'],
      brilho: 'rgba(255,255,255,.30)',
      textura: 'listras',
      janela: 'arco',
      aro: 'rgba(255,255,255,.42)',
      tintaExtra: '#ffffff',
      selo: { texto: 'BORA COM A BIANCA', fundo: '#ffffff', tinta: '#0756d9', borda: '#061f62' },
      placa: {
        fundo: '#061f62',
        cargoFundo: '#12d9e7', cargoTinta: '#061f62',
        nome: '#ffffff', destaque: '#12d9e7',
        numeroFundo: '#ffdf10', numeroTinta: '#061f62',
        assinatura: '#ffdf10', risco: '#12d9e7'
      }
    }
  ]
};
