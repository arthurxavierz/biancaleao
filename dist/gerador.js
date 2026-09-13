/* ==================================================================
   GERADOR DE FOTOS — motor
   ------------------------------------------------------------------
   Genérico de propósito: tudo o que é da campanha vive em gerador-campanha.js.
   As molduras são desenhadas no canvas a partir dos tokens de cor e
   forma, então qualquer formato sai em alta resolução sem precisar de
   arquivo de arte. Nenhuma imagem sai do aparelho do apoiador.
================================================================== */
(function () {
  'use strict';

  var CFG = window.GERADOR_CAMPANHA;
  if (!CFG) { return; }

  var COR = CFG.cores;
  var FONTE = CFG.fontes;
  var NOME_COMPLETO = (CFG.candidato.nome + ' ' + CFG.candidato.sobrenome).trim();

  /* ---------------- Estado ---------------- */
  var estado = {
    imagem: null,
    formato: CFG.formatos[0],
    moldura: CFG.molduras[0],
    vista: { zoom: 1, ox: 0, oy: 0 },
    fontesProntas: false,
    passo: 1,
    blobFinal: null,
    urlFinal: ''
  };

  /* ---------------- Atalhos de DOM ---------------- */
  var $ = function (seletor, base) { return (base || document).querySelector(seletor); };
  var $$ = function (seletor, base) { return Array.prototype.slice.call((base || document).querySelectorAll(seletor)); };

  var telaPrincipal = $('[data-canvas]');
  var ctxPrincipal = telaPrincipal.getContext('2d');
  var caixaFormatos = $('[data-formatos]');
  var caixaMolduras = $('[data-molduras]');
  var entradaGaleria = $('[data-entrada-galeria]');
  var entradaCamera = $('[data-entrada-camera]');
  var imagemFinal = $('[data-resultado]');
  var botaoBaixar = $('[data-acao="baixar"]');
  var botaoCompartilhar = $('[data-acao="compartilhar"]');
  var caixaAviso = $('[data-aviso]');

  /* ==================================================================
     Utilidades de desenho
  ================================================================== */

  function retanguloArredondado(ctx, x, y, largura, altura, raio) {
    var r = Math.min(raio, largura / 2, altura / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + largura - r, y);
    ctx.quadraticCurveTo(x + largura, y, x + largura, y + r);
    ctx.lineTo(x + largura, y + altura - r);
    ctx.quadraticCurveTo(x + largura, y + altura, x + largura - r, y + altura);
    ctx.lineTo(x + r, y + altura);
    ctx.quadraticCurveTo(x, y + altura, x, y + altura - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* Texto com espaçamento entre letras, medido caractere a caractere
     para funcionar igual em todos os navegadores. */
  function larguraRastreada(ctx, texto, espaco) {
    var total = 0;
    for (var i = 0; i < texto.length; i++) { total += ctx.measureText(texto[i]).width; }
    return total + espaco * Math.max(0, texto.length - 1);
  }

  function textoRastreado(ctx, texto, x, y, espaco, alinhamento) {
    var total = larguraRastreada(ctx, texto, espaco);
    var cursor = alinhamento === 'centro' ? x - total / 2 : alinhamento === 'direita' ? x - total : x;
    var anterior = ctx.textAlign;
    ctx.textAlign = 'left';
    for (var i = 0; i < texto.length; i++) {
      ctx.fillText(texto[i], cursor, y);
      cursor += ctx.measureText(texto[i]).width + espaco;
    }
    ctx.textAlign = anterior;
    return total;
  }

  function fonteDisplay(tamanho) { return tamanho + 'px ' + FONTE.display; }
  function fonteCorpo(tamanho, peso) { return (peso || 800) + ' ' + tamanho + 'px ' + FONTE.corpo; }
  function fonteScript(tamanho) { return '700 ' + tamanho + 'px ' + FONTE.script; }

  /* ==================================================================
     Camada de fundo da moldura
  ================================================================== */

  function pintarFundo(ctx, L, A, moldura) {
    var gradiente = ctx.createLinearGradient(0, 0, L * 0.35, A);
    gradiente.addColorStop(0, moldura.fundo[0]);
    gradiente.addColorStop(1, moldura.fundo[1]);
    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, L, A);

    if (moldura.brilho) {
      var halo = ctx.createRadialGradient(L * 0.78, A * 0.16, 0, L * 0.78, A * 0.16, L * 0.72);
      halo.addColorStop(0, moldura.brilho);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, L, A);
    }

    var e = L / 1080;
    ctx.save();

    if (moldura.textura === 'pontos') {
      ctx.fillStyle = 'rgba(255,255,255,.22)';
      var passo = 30 * e;
      for (var y = passo; y < A; y += passo) {
        for (var x = passo; x < L; x += passo) {
          ctx.beginPath();
          ctx.arc(x, y, 2.1 * e, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (moldura.textura === 'anel') {
      ctx.strokeStyle = 'rgba(255,255,255,.42)';
      ctx.lineWidth = 2 * e;
      for (var i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(L * 0.5, A * 0.45, L * 0.2 * i, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (moldura.textura === 'listras') {
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.lineWidth = 14 * e;
      var salto = 58 * e;
      for (var d = -A; d < L + A; d += salto) {
        ctx.beginPath();
        ctx.moveTo(d, 0);
        ctx.lineTo(d + A, A);
        ctx.stroke();
      }
    }

    ctx.restore();

    /* Faixa inferior em ângulo, assinatura visual do site */
    ctx.save();
    ctx.translate(L * 0.5, A);
    ctx.rotate(-0.09);
    ctx.fillStyle = 'rgba(255,255,255,.10)';
    ctx.fillRect(-L, -A * 0.10, L * 2, A * 0.30);
    ctx.restore();
  }

  /* ==================================================================
     Janela da foto
  ================================================================== */

  function caminhoJanela(ctx, forma, cx, cy, largura, altura) {
    var x = cx - largura / 2;
    var y = cy - altura / 2;
    ctx.beginPath();
    if (forma === 'circulo') {
      ctx.arc(cx, cy, Math.min(largura, altura) / 2, 0, Math.PI * 2);
    } else if (forma === 'arco') {
      var r = largura / 2;
      var rb = largura * 0.07;
      ctx.moveTo(x, y + altura - rb);
      ctx.lineTo(x, y + r);
      ctx.arc(cx, y + r, r, Math.PI, 0);
      ctx.lineTo(x + largura, y + altura - rb);
      ctx.quadraticCurveTo(x + largura, y + altura, x + largura - rb, y + altura);
      ctx.lineTo(x + rb, y + altura);
      ctx.quadraticCurveTo(x, y + altura, x, y + altura - rb);
      ctx.closePath();
    } else {
      retanguloArredondado(ctx, x, y, largura, altura, largura * 0.1);
    }
  }

  /* ==================================================================
     Placa de assinatura (nome, número e slogan)
  ================================================================== */

  function medirPlaca(ctx, escala, larguraMaxima, tentativa) {
    var e = escala;
    var pad = 42 * e;
    var m = {
      e: e,
      pad: pad,
      fCargo: 23 * e,
      trCargo: 3.2 * e,
      fNome: 78 * e,
      fNum: 104 * e,
      fAss: 50 * e
    };

    ctx.font = fonteCorpo(m.fCargo, 800);
    m.larguraCargo = larguraRastreada(ctx, CFG.candidato.cargo, m.trCargo);
    m.padCargo = 16 * e;
    m.alturaCargo = m.fCargo * 2.1;

    ctx.font = fonteDisplay(m.fNome);
    m.larguraNomeBase = ctx.measureText(CFG.candidato.nome + ' ').width;
    m.larguraNome = ctx.measureText(NOME_COMPLETO).width;

    ctx.font = fonteDisplay(m.fNum);
    m.larguraTextoNum = ctx.measureText(CFG.candidato.numero).width;
    m.padNum = 15 * e;
    m.larguraNum = m.larguraTextoNum + m.padNum * 2;
    m.alturaNum = m.fNum * 0.96;
    m.vaoNome = 22 * e;

    ctx.font = fonteScript(m.fAss);
    m.larguraAss = ctx.measureText(CFG.candidato.assinatura).width;

    var linhaNome = m.larguraNome + m.vaoNome + m.larguraNum;
    var conteudo = Math.max(m.larguraCargo + m.padCargo * 2, linhaNome, m.larguraAss);
    m.largura = conteudo + pad * 2;

    if (m.largura > larguraMaxima && (tentativa || 0) < 4) {
      return medirPlaca(ctx, e * (larguraMaxima / m.largura), larguraMaxima, (tentativa || 0) + 1);
    }

    m.linhaNome = linhaNome;
    m.topoCargo = pad * 0.6;
    m.baseNome = m.topoCargo + m.alturaCargo + 30 * e + m.fNome * 0.76;
    m.baseAss = m.baseNome + 26 * e + m.fAss * 0.68;
    m.altura = m.baseAss + m.fAss * 0.34 + pad * 0.55;
    return m;
  }

  function desenharPlaca(ctx, m, moldura, centroX, topo) {
    var p = moldura.placa;
    var e = m.e;
    var x = centroX - m.largura / 2;

    ctx.save();
    ctx.translate(centroX, topo + m.altura / 2);
    ctx.rotate(-0.018);
    ctx.translate(-centroX, -(topo + m.altura / 2));

    /* Cartão */
    ctx.save();
    ctx.shadowColor = 'rgba(4,12,38,.28)';
    ctx.shadowBlur = 34 * e;
    ctx.shadowOffsetY = 14 * e;
    ctx.fillStyle = p.fundo;
    retanguloArredondado(ctx, x, topo, m.largura, m.altura, 22 * e);
    ctx.fill();
    ctx.restore();

    /* Etiqueta do cargo */
    var larguraEtiqueta = m.larguraCargo + m.padCargo * 2;
    ctx.fillStyle = p.cargoFundo;
    retanguloArredondado(ctx, centroX - larguraEtiqueta / 2, topo + m.topoCargo, larguraEtiqueta, m.alturaCargo, m.alturaCargo / 2);
    ctx.fill();

    ctx.fillStyle = p.cargoTinta;
    ctx.font = fonteCorpo(m.fCargo, 800);
    ctx.textBaseline = 'middle';
    textoRastreado(ctx, CFG.candidato.cargo, centroX, topo + m.topoCargo + m.alturaCargo / 2 + 1 * e, m.trCargo, 'centro');
    ctx.textBaseline = 'alphabetic';

    /* Nome e número */
    var inicio = centroX - m.linhaNome / 2;
    ctx.textAlign = 'left';
    ctx.font = fonteDisplay(m.fNome);
    ctx.fillStyle = p.nome;
    ctx.fillText(CFG.candidato.nome + ' ', inicio, topo + m.baseNome);
    ctx.fillStyle = p.destaque;
    ctx.fillText(CFG.candidato.sobrenome, inicio + m.larguraNomeBase, topo + m.baseNome);

    var numX = inicio + m.larguraNome + m.vaoNome;
    var numY = topo + m.baseNome - m.fNome * 0.74;
    var numMeioY = numY + m.alturaNum / 2;

    ctx.save();
    ctx.translate(numX + m.larguraNum / 2, numMeioY);
    ctx.rotate(-0.035);
    ctx.fillStyle = p.numeroFundo;
    retanguloArredondado(ctx, -m.larguraNum / 2, -m.alturaNum / 2, m.larguraNum, m.alturaNum, 8 * e);
    ctx.fill();
    ctx.fillStyle = p.numeroTinta;
    ctx.font = fonteDisplay(m.fNum);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(CFG.candidato.numero, 0, m.fNum * 0.055);
    ctx.restore();

    /* Assinatura manuscrita com risco */
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = fonteScript(m.fAss);
    ctx.fillStyle = p.assinatura;
    ctx.fillText(CFG.candidato.assinatura, centroX, topo + m.baseAss);

    ctx.strokeStyle = p.risco;
    ctx.lineWidth = 5 * e;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centroX - m.larguraAss / 2, topo + m.baseAss + 19 * e);
    ctx.quadraticCurveTo(centroX, topo + m.baseAss + 27 * e, centroX + m.larguraAss / 2, topo + m.baseAss + 18 * e);
    ctx.stroke();

    ctx.restore();
  }

  /* ==================================================================
     Selo adesivo
  ================================================================== */

  function desenharSelo(ctx, moldura, escala, x, y, larguraMaxima, limiteDireito) {
    var selo = moldura.selo;
    if (!selo || !selo.texto) { return; }
    var e = escala;
    var tamanho = 40 * e;

    ctx.font = fonteDisplay(tamanho);
    var largura = ctx.measureText(selo.texto).width;
    var padX = 26 * e;
    var total = largura + padX * 2;
    if (total > larguraMaxima) {
      var reducao = larguraMaxima / total;
      tamanho = tamanho * reducao;
      padX = padX * reducao;
      ctx.font = fonteDisplay(tamanho);
      largura = ctx.measureText(selo.texto).width;
      total = largura + padX * 2;
    }
    var alturaSelo = tamanho * 1.85;

    /* Mantem a etiqueta inteira dentro da arte */
    var meio = total / 2 + 12 * e;
    x = Math.min(x, limiteDireito - meio);
    x = Math.max(x, meio);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.055);

    ctx.shadowColor = 'rgba(4,12,38,.32)';
    ctx.shadowBlur = 26 * e;
    ctx.shadowOffsetY = 10 * e;
    ctx.fillStyle = selo.borda;
    retanguloArredondado(ctx, -total / 2 - 7 * e, -alturaSelo / 2 - 7 * e, total + 14 * e, alturaSelo + 14 * e, 16 * e);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    ctx.fillStyle = selo.fundo;
    retanguloArredondado(ctx, -total / 2, -alturaSelo / 2, total, alturaSelo, 11 * e);
    ctx.fill();

    ctx.fillStyle = selo.tinta;
    ctx.font = fonteDisplay(tamanho);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selo.texto, 0, tamanho * 0.06);
    ctx.restore();
  }

  /* ==================================================================
     Layout e composição
  ================================================================== */

  function calcularLayout(ctx, L, A, moldura) {
    var e = L / 1080;
    var placa = medirPlaca(ctx, e, L * 0.9);
    var sobreposicao = placa.altura * 0.42;
    var razao = moldura.janela === 'arco' ? 1.18 : moldura.janela === 'janela' ? 1.1 : 1;

    var largura = L - L * 0.075 * 2;
    var altura = largura * razao;
    var disponivel = A - A * 0.05 * 2 - (placa.altura - sobreposicao);
    if (altura > disponivel) {
      altura = disponivel;
      largura = altura / razao;
    }

    var blocoAltura = altura + (placa.altura - sobreposicao);
    var alto = A > L * 1.15;
    var topo = alto ? (A - blocoAltura) * 0.45 : (A - blocoAltura) / 2;

    return {
      e: e,
      largura: largura,
      altura: altura,
      cx: L / 2,
      cy: topo + altura / 2,
      placa: placa,
      placaTopo: topo + altura - sobreposicao,
      alto: alto
    };
  }

  /* Camada que fica atrás da foto */
  function desenharFundoMoldura(ctx, L, A, moldura, layout) {
    pintarFundo(ctx, L, A, moldura);
    ctx.save();
    caminhoJanela(ctx, moldura.janela, layout.cx, layout.cy, layout.largura, layout.altura);
    ctx.fillStyle = 'rgba(6,31,98,.55)';
    ctx.fill();
    ctx.restore();
  }

  /* Camada que fica à frente da foto */
  function desenharFrenteMoldura(ctx, L, A, moldura, layout) {
    var e = layout.e;

    ctx.save();
    caminhoJanela(ctx, moldura.janela, layout.cx, layout.cy, layout.largura, layout.altura);
    ctx.strokeStyle = moldura.aro;
    ctx.lineWidth = 9 * e;
    ctx.stroke();
    ctx.restore();

    /* A etiqueta sobe para o alto da janela, encostada na borda de cima
       da parte redonda. Centralizada ela cobria o rosto da foto. */
    var seloX = layout.cx + layout.largura * 0.25;
    var seloY = layout.cy - layout.altura * 0.40;
    desenharSelo(ctx, moldura, e, seloX, seloY, L * 0.66, L - L * 0.045);

    desenharPlaca(ctx, layout.placa, moldura, layout.cx, layout.placaTopo);

    if (layout.alto) { desenharExtras(ctx, L, A, moldura, layout); }
  }

  /* Respiro dos formatos verticais: regiao no topo e perfil no rodape */
  function desenharExtras(ctx, L, A, moldura, layout) {
    var e = layout.e;
    var tinta = moldura.tintaExtra || '#ffffff';

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = tinta;
    ctx.textBaseline = 'middle';
    ctx.font = fonteCorpo(24 * e, 800);
    var larguraRegiao = textoRastreado(ctx, CFG.candidato.regiao, L / 2, A * 0.072, 8 * e, 'centro');

    ctx.strokeStyle = tinta;
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = 2 * e;
    ctx.beginPath();
    ctx.moveTo(L / 2 - larguraRegiao / 2 - 40 * e, A * 0.072);
    ctx.lineTo(L / 2 - larguraRegiao / 2 - 14 * e, A * 0.072);
    ctx.moveTo(L / 2 + larguraRegiao / 2 + 14 * e, A * 0.072);
    ctx.lineTo(L / 2 + larguraRegiao / 2 + 40 * e, A * 0.072);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.fillStyle = tinta;
    ctx.textAlign = 'center';
    ctx.font = fonteDisplay(34 * e);
    ctx.fillText('@' + CFG.candidato.instagram, L / 2, A - A * 0.075);

    ctx.globalAlpha = 0.62;
    ctx.font = fonteCorpo(21 * e, 700);
    textoRastreado(ctx, 'ACOMPANHE A CAMPANHA', L / 2, A - A * 0.045, 5 * e, 'centro');
    ctx.restore();
  }

  /* Foto do apoiador, recortada pela janela */
  function desenharFoto(ctx, imagem, layout, moldura, vista) {
    if (!imagem) { return; }
    var caixa = ajustarVista(imagem, layout, vista);
    ctx.save();
    caminhoJanela(ctx, moldura.janela, layout.cx, layout.cy, layout.largura, layout.altura);
    ctx.clip();
    ctx.drawImage(imagem, caixa.x, caixa.y, caixa.largura, caixa.altura);
    ctx.restore();
  }

  /* Converte zoom e deslocamento (frações) em coordenadas de desenho,
     garantindo que a foto sempre preencha a janela. */
  function ajustarVista(imagem, layout, vista) {
    var cobrir = Math.max(layout.largura / imagem.width, layout.altura / imagem.height);
    var escala = cobrir * vista.zoom;
    var largura = imagem.width * escala;
    var altura = imagem.height * escala;
    var limiteX = Math.max(0, (largura - layout.largura) / 2);
    var limiteY = Math.max(0, (altura - layout.altura) / 2);
    var ox = Math.max(-limiteX, Math.min(limiteX, vista.ox * layout.largura));
    var oy = Math.max(-limiteY, Math.min(limiteY, vista.oy * layout.altura));
    return {
      x: layout.cx - largura / 2 + ox,
      y: layout.cy - altura / 2 + oy,
      largura: largura,
      altura: altura,
      limiteX: limiteX / layout.largura,
      limiteY: limiteY / layout.altura
    };
  }

  function compor(ctx, L, A, moldura, imagem, vista) {
    ctx.clearRect(0, 0, L, A);
    var layout = calcularLayout(ctx, L, A, moldura);
    desenharFundoMoldura(ctx, L, A, moldura, layout);
    desenharFoto(ctx, imagem, layout, moldura, vista);
    desenharFrenteMoldura(ctx, L, A, moldura, layout);
    return layout;
  }

  /* ==================================================================
     Render principal
  ================================================================== */

  var layoutAtual = null;
  var pedidoDeQuadro = null;

  function renderizar() {
    pedidoDeQuadro = null;
    var L = estado.formato.largura;
    var A = estado.formato.altura;
    if (telaPrincipal.width !== L || telaPrincipal.height !== A) {
      telaPrincipal.width = L;
      telaPrincipal.height = A;
    }
    layoutAtual = compor(ctxPrincipal, L, A, estado.moldura, estado.imagem, estado.vista);
  }

  function pedirRender() {
    if (pedidoDeQuadro === null) { pedidoDeQuadro = requestAnimationFrame(renderizar); }
  }

  /* ==================================================================
     Interface
  ================================================================== */

  function irParaPasso(numero) {
    estado.passo = numero;
    $$('.passo').forEach(function (secao) {
      var ativo = Number(secao.dataset.passo) === numero;
      secao.hidden = !ativo;
      secao.classList.toggle('is-ativo', ativo);
    });
    $$('.trilha__item').forEach(function (item) {
      item.classList.toggle('is-ativo', Number(item.dataset.trilha) <= numero);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function avisar(mensagem) {
    caixaAviso.textContent = mensagem;
    caixaAviso.classList.add('is-visible');
    clearTimeout(avisar.tempo);
    avisar.tempo = setTimeout(function () { caixaAviso.classList.remove('is-visible'); }, 4200);
  }

  function iconeCheque() {
    return '<span class="formato__check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 12.5 5 5 10-11"/></svg></span>';
  }

  function montarFormatos() {
    caixaFormatos.innerHTML = '';
    CFG.formatos.forEach(function (formato) {
      var botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'formato' + (formato.id === estado.formato.id ? ' is-ativo' : '');
      botao.setAttribute('role', 'radio');
      botao.setAttribute('aria-checked', String(formato.id === estado.formato.id));
      botao.innerHTML =
        '<span class="formato__icone" data-proporcao="' + formato.id + '"></span>' +
        '<span class="formato__texto"><span class="formato__nome">' + formato.nome + '</span>' +
        '<span class="formato__medida">' + formato.medida + '</span></span>' + iconeCheque();
      botao.addEventListener('click', function () {
        estado.formato = formato;
        $$('.formato', caixaFormatos).forEach(function (outro, indice) {
          var ativo = CFG.formatos[indice].id === formato.id;
          outro.classList.toggle('is-ativo', ativo);
          outro.setAttribute('aria-checked', String(ativo));
        });
        pedirRender();
      });
      caixaFormatos.appendChild(botao);
    });
  }

  function montarMolduras() {
    caixaMolduras.innerHTML = '';
    CFG.molduras.forEach(function (moldura) {
      var botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'moldura' + (moldura.id === estado.moldura.id ? ' is-ativo' : '');
      botao.setAttribute('role', 'radio');
      botao.setAttribute('aria-checked', String(moldura.id === estado.moldura.id));
      botao.setAttribute('aria-label', 'Moldura ' + moldura.id + ', ' + moldura.nome);
      botao.innerHTML =
        '<canvas width="360" height="360"></canvas>' +
        '<span class="moldura__nome">' + moldura.id + '</span>' +
        '<span class="moldura__check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4.5 12.5 5 5 10-11"/></svg></span>';
      botao.addEventListener('click', function () {
        estado.moldura = moldura;
        $$('.moldura', caixaMolduras).forEach(function (outro, indice) {
          var ativo = CFG.molduras[indice].id === moldura.id;
          outro.classList.toggle('is-ativo', ativo);
          outro.setAttribute('aria-checked', String(ativo));
        });
        pedirRender();
      });
      caixaMolduras.appendChild(botao);
    });
    atualizarMiniaturas();
  }

  function atualizarMiniaturas() {
    $$('.moldura canvas', caixaMolduras).forEach(function (tela, indice) {
      var ctx = tela.getContext('2d');
      compor(ctx, tela.width, tela.height, CFG.molduras[indice], estado.imagem, estado.vista);
    });
  }

  /* Molduras de exemplo na capa: o mesmo motor, sem foto nenhuma. */
  function desenharAmostras() {
    $$('[data-amostra]').forEach(function (tela, indice) {
      var moldura = CFG.molduras[indice % CFG.molduras.length];
      compor(tela.getContext('2d'), tela.width, tela.height, moldura, null, estado.vista);
    });
  }

  /* ==================================================================
     Foto do apoiador
  ================================================================== */

  function carregarArquivo(arquivo) {
    if (!arquivo) { return; }
    if (!/^image\//.test(arquivo.type)) {
      avisar('Escolha um arquivo de imagem (JPG, PNG ou WEBP).');
      return;
    }

    var aoTerminar = function (bitmap) {
      estado.imagem = bitmap;
      estado.vista = { zoom: 1, ox: 0, oy: 0 };
      irParaPasso(2);
      pedirRender();
      atualizarMiniaturas();
    };

    if (window.createImageBitmap) {
      createImageBitmap(arquivo, { imageOrientation: 'from-image' })
        .then(aoTerminar)
        .catch(function () { carregarPorElemento(arquivo, aoTerminar); });
    } else {
      carregarPorElemento(arquivo, aoTerminar);
    }
  }

  function carregarPorElemento(arquivo, aoTerminar) {
    var url = URL.createObjectURL(arquivo);
    var img = new Image();
    img.onload = function () { aoTerminar(img); URL.revokeObjectURL(url); };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      avisar('Não foi possível abrir essa imagem. Tente outra foto.');
    };
    img.src = url;
  }

  entradaGaleria.addEventListener('change', function (evento) { carregarArquivo(evento.target.files[0]); evento.target.value = ''; });
  entradaCamera.addEventListener('change', function (evento) { carregarArquivo(evento.target.files[0]); evento.target.value = ''; });

  /* ==================================================================
     Arrastar, ampliar e centralizar
  ================================================================== */

  var ponteiros = {};
  var distanciaInicial = 0;
  var zoomInicial = 1;

  function aplicarLimites() {
    if (!estado.imagem || !layoutAtual) { return; }
    var caixa = ajustarVista(estado.imagem, layoutAtual, estado.vista);
    estado.vista.ox = Math.max(-caixa.limiteX, Math.min(caixa.limiteX, estado.vista.ox));
    estado.vista.oy = Math.max(-caixa.limiteY, Math.min(caixa.limiteY, estado.vista.oy));
  }

  function fatorTela() {
    var retangulo = telaPrincipal.getBoundingClientRect();
    return {
      x: retangulo.width ? telaPrincipal.width / retangulo.width : 1,
      y: retangulo.height ? telaPrincipal.height / retangulo.height : 1
    };
  }

  telaPrincipal.addEventListener('pointerdown', function (evento) {
    if (!estado.imagem) { return; }
    try { telaPrincipal.setPointerCapture(evento.pointerId); } catch (erro) { /* ponteiro sintetico */ }
    ponteiros[evento.pointerId] = { x: evento.clientX, y: evento.clientY };
    var chaves = Object.keys(ponteiros);
    if (chaves.length === 2) {
      var a = ponteiros[chaves[0]];
      var b = ponteiros[chaves[1]];
      distanciaInicial = Math.hypot(a.x - b.x, a.y - b.y);
      zoomInicial = estado.vista.zoom;
    }
  });

  telaPrincipal.addEventListener('pointermove', function (evento) {
    if (!estado.imagem || !ponteiros[evento.pointerId] || !layoutAtual) { return; }
    var chaves = Object.keys(ponteiros);

    if (chaves.length >= 2) {
      ponteiros[evento.pointerId] = { x: evento.clientX, y: evento.clientY };
      var a = ponteiros[chaves[0]];
      var b = ponteiros[chaves[1]];
      var distancia = Math.hypot(a.x - b.x, a.y - b.y);
      if (distanciaInicial > 0) {
        estado.vista.zoom = Math.max(1, Math.min(4, zoomInicial * (distancia / distanciaInicial)));
        aplicarLimites();
        pedirRender();
      }
      return;
    }

    var anterior = ponteiros[evento.pointerId];
    var escala = fatorTela();
    estado.vista.ox += ((evento.clientX - anterior.x) * escala.x) / layoutAtual.largura;
    estado.vista.oy += ((evento.clientY - anterior.y) * escala.y) / layoutAtual.altura;
    ponteiros[evento.pointerId] = { x: evento.clientX, y: evento.clientY };
    aplicarLimites();
    pedirRender();
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (nome) {
    telaPrincipal.addEventListener(nome, function (evento) {
      delete ponteiros[evento.pointerId];
      distanciaInicial = 0;
      atualizarMiniaturas();
    });
  });

  /* A roda só amplia quando o gesto é de zoom (pinça do trackpad ou Ctrl).
     Rolagem comum continua rolando a página, senão o cursor sobre a prévia
     prenderia a leitura. */
  telaPrincipal.addEventListener('wheel', function (evento) {
    if (!estado.imagem || !(evento.ctrlKey || evento.metaKey)) { return; }
    evento.preventDefault();
    estado.vista.zoom = Math.max(1, Math.min(4, estado.vista.zoom * (evento.deltaY > 0 ? 0.94 : 1.06)));
    aplicarLimites();
    pedirRender();
  }, { passive: false });

  $$('[data-zoom]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var direcao = Number(botao.dataset.zoom);
      estado.vista.zoom = Math.max(1, Math.min(4, estado.vista.zoom * (direcao > 0 ? 1.16 : 1 / 1.16)));
      aplicarLimites();
      pedirRender();
      atualizarMiniaturas();
    });
  });

  /* ==================================================================
     Ações
  ================================================================== */

  function gerarArquivo() {
    return new Promise(function (resolve, reject) {
      renderizar();
      if (!telaPrincipal.toBlob) {
        reject(new Error('sem suporte'));
        return;
      }
      telaPrincipal.toBlob(function (blob) {
        if (blob) { resolve(blob); } else { reject(new Error('falhou')); }
      }, 'image/png');
    });
  }

  function finalizar() {
    if (!estado.imagem) {
      avisar('Escolha uma foto para continuar.');
      return;
    }
    gerarArquivo().then(function (blob) {
      if (estado.urlFinal) { URL.revokeObjectURL(estado.urlFinal); }
      estado.blobFinal = blob;
      estado.urlFinal = URL.createObjectURL(blob);
      var nome = CFG.arquivo + '-' + estado.formato.id + '.png';
      imagemFinal.src = estado.urlFinal;
      botaoBaixar.href = estado.urlFinal;
      botaoBaixar.setAttribute('download', nome);
      botaoCompartilhar.hidden = !podeCompartilhar(blob, nome);
      irParaPasso(3);
    }).catch(function () {
      avisar('Não foi possível montar a imagem. Tente novamente.');
    });
  }

  function podeCompartilhar(blob, nome) {
    if (!navigator.canShare || !navigator.share) { return false; }
    try {
      return navigator.canShare({ files: [new File([blob], nome, { type: 'image/png' })] });
    } catch (erro) {
      return false;
    }
  }

  document.addEventListener('click', function (evento) {
    var alvo = evento.target.closest('[data-acao]');
    if (!alvo) { return; }
    var acao = alvo.dataset.acao;

    if (acao === 'galeria') { entradaGaleria.click(); }
    if (acao === 'camera') { entradaCamera.click(); }
    if (acao === 'centralizar') {
      estado.vista = { zoom: 1, ox: 0, oy: 0 };
      pedirRender();
      atualizarMiniaturas();
    }
    if (acao === 'finalizar') { finalizar(); }
    if (acao === 'voltar') { irParaPasso(2); pedirRender(); }
    if (acao === 'trocar') { entradaGaleria.click(); }
    if (acao === 'compartilhar') {
      var nome = CFG.arquivo + '-' + estado.formato.id + '.png';
      var arquivo = new File([estado.blobFinal], nome, { type: 'image/png' });
      navigator.share({
        files: [arquivo],
        title: NOME_COMPLETO + ' ' + CFG.candidato.numero,
        text: 'Eu tô com ' + CFG.candidato.nome + ' ' + CFG.candidato.numero + '.'
      }).catch(function () { /* cancelado pelo usuário */ });
    }
  });

  /* ==================================================================
     Início
  ================================================================== */

  var legal = $('[data-legal]');
  if (legal) { legal.textContent = CFG.candidato.legal || ''; }

  montarFormatos();
  montarMolduras();
  desenharAmostras();

  function prepararFontes() {
    if (!document.fonts || !document.fonts.load) { return Promise.resolve(); }
    return Promise.all([
      document.fonts.load('400 100px ' + FONTE.display),
      document.fonts.load('800 100px ' + FONTE.corpo),
      document.fonts.load('700 100px ' + FONTE.script)
    ]).catch(function () { return null; });
  }

  prepararFontes().then(function () {
    estado.fontesProntas = true;
    pedirRender();
    atualizarMiniaturas();
    desenharAmostras();
  });

  pedirRender();
  atualizarMiniaturas();
})();
