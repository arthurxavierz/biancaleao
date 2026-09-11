/* ------------------------------------------------------------------
   CONFIGURAÇÃO DA CAMPANHA
   Único lugar a editar para colocar o site no ar.
   - whatsappNumber: número que recebe os cadastros, formato internacional
     apenas com dígitos (55 + DDD + número). Ex.: '5534999999999'.
   - whatsappGroupUrl: link do convite do grupo oficial (chat.whatsapp.com/...).
     Deixe vazio enquanto o convite não existir: o botão avisa que está pendente.
------------------------------------------------------------------ */
const SITE_CONFIG = {
  whatsappNumber: '',
  whatsappGroupUrl: ''
};

const body = document.body;
const loader = document.querySelector('.intro-loader');
const header = document.querySelector('[data-header]');
const progress = document.querySelector('.page-progress span');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const cursorGlow = document.querySelector('.cursor-glow');
const modal = document.querySelector('[data-modal]');

const priorities = {
  mental: {
    number: '01', tag: 'SAÚDE MENTAL', title: 'CUIDADO MAIS PERTO',
    copy: 'Uma agenda para aproximar prevenção, acolhimento e continuidade do cuidado das pessoas e das famílias.',
    items: [
      'Fortalecer a saúde mental na atenção básica e nas redes municipais.',
      'Apoiar formação contínua para profissionais que atuam na linha de frente.',
      'Defender ações de prevenção em escolas, ambientes de trabalho e comunidades.'
    ]
  },
  diabetes: {
    number: '02', tag: 'DIABETES', title: 'INFORMAÇÃO QUE PROTEGE',
    copy: 'Cuidado contínuo depende de informação clara, acesso organizado e apoio para a vida cotidiana.',
    items: [
      'Estimular campanhas permanentes de orientação e diagnóstico precoce.',
      'Apoiar redes regionais de atendimento multiprofissional.',
      'Valorizar a participação de associações e famílias na construção das políticas.'
    ]
  },
  mulheres: {
    number: '03', tag: 'MULHERES E FAMÍLIAS', title: 'REDE QUE ACOLHE',
    copy: 'As políticas precisam considerar saúde, segurança, trabalho e autonomia de maneira conectada.',
    items: [
      'Fortalecer acolhimento e orientação para mulheres em situação de vulnerabilidade.',
      'Apoiar saúde mental materna e redes de suporte familiar.',
      'Incentivar qualificação e autonomia econômica nos municípios.'
    ]
  },
  infancia: {
    number: '04', tag: 'PRIMEIRA INFÂNCIA', title: 'COMEÇAR BEM MUDA TUDO',
    copy: 'Os primeiros anos influenciam toda a vida e exigem atenção coordenada entre família, saúde e educação.',
    items: [
      'Defender integração entre saúde, educação e assistência na primeira infância.',
      'Apoiar orientação prática para mães, pais e cuidadores.',
      'Valorizar iniciativas de desenvolvimento infantil nos municípios.'
    ]
  },
  esporte: {
    number: '05', tag: 'ESPORTE E OPORTUNIDADE', title: 'DISCIPLINA QUE ABRE CAMINHOS',
    copy: 'O esporte pode construir saúde, convivência, confiança e novas perspectivas para crianças e jovens.',
    items: [
      'Apoiar projetos esportivos conectados à educação e à inclusão.',
      'Valorizar profissionais e organizações que atuam nas comunidades.',
      'Incentivar participação feminina e acesso seguro ao esporte.'
    ]
  },
  voluntariado: {
    number: '06', tag: 'VOLUNTARIADO', title: 'QUEM FAZ PRECISA DE APOIO',
    copy: 'Organizações locais conhecem problemas de perto e podem ampliar resultados quando encontram apoio responsável.',
    items: [
      'Aproximar entidades de oportunidades de capacitação e financiamento.',
      'Estimular transparência, gestão e prestação de contas no terceiro setor.',
      'Criar canais de diálogo entre organizações e políticas públicas.'
    ]
  }
};

const networkContent = {
  pessoa: ['01','PESSOA','Escuta qualificada, orientação clara e acesso ao cuidado no momento certo.'],
  familia: ['02','FAMÍLIA','Informação, acolhimento e suporte para quem acompanha cada etapa do cuidado.'],
  municipio: ['03','MUNICÍPIO','Serviços próximos, equipes preparadas e articulação para atender cada realidade local.']
};

const finishLoading = () => window.setTimeout(() => loader?.classList.add("is-finished"), 850);
if (document.readyState === 'complete') finishLoading();
else window.addEventListener('load', finishLoading, { once: true });

const updateScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  header.classList.toggle('is-scrolled', scrollY > 22);
};
addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

menuButton?.addEventListener('click', () => {
  const open = body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded','false');
  menuButton.setAttribute('aria-label','Abrir menu');
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -35px' });
document.querySelectorAll('.reveal').forEach((item,index) => {
  item.style.transitionDelay = `${Math.min(index % 4,3) * 65}ms`;
  observer.observe(item);
});

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => {
    item.classList.toggle('is-active',item === button);
    item.setAttribute('aria-selected',String(item === button));
  });
  document.querySelectorAll('[data-category]').forEach(card => card.classList.toggle('is-hidden',filter !== 'all' && card.dataset.category !== filter));
}));

document.querySelectorAll('[data-network]').forEach(button => button.addEventListener('click', () => {
  const content = networkContent[button.dataset.network];
  document.querySelectorAll('[data-network]').forEach(item => item.classList.toggle('is-active',item === button));
  const nodes = [document.querySelector('[data-network-index]'),document.querySelector('[data-network-title]'),document.querySelector('[data-network-copy]')];
  nodes.forEach((node,index) => {
    node.textContent = content[index];
    node.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.16,1,.3,1)'});
  });
}));

const openPriority = key => {
  const content = priorities[key];
  if (!content || !modal) return;
  modal.querySelector('[data-modal-number]').textContent = content.number;
  modal.querySelector('[data-modal-tag]').textContent = content.tag;
  modal.querySelector('[data-modal-title]').textContent = content.title;
  modal.querySelector('[data-modal-copy]').textContent = content.copy;
  modal.querySelector('[data-modal-list]').innerHTML = content.items.map(item => `<li>${item}</li>`).join('');
  modal.showModal();
  body.classList.add('modal-open');
};
document.querySelectorAll('[data-priority]').forEach(button => button.addEventListener('click', () => openPriority(button.dataset.priority)));
const closeModal = () => { modal?.close(); body.classList.remove('modal-open'); };
document.querySelector('[data-modal-close]')?.addEventListener('click', closeModal);
modal?.addEventListener('click',event => { if (event.target === modal) closeModal(); });
modal?.addEventListener('close',() => body.classList.remove('modal-open'));

if (matchMedia('(pointer:fine)').matches) {
  addEventListener('pointermove',event => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  },{passive:true});

  document.querySelectorAll('.magnetic').forEach(item => {
    item.addEventListener('pointermove',event => {
      const rect = item.getBoundingClientRect();
      item.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .12}px,${(event.clientY - rect.top - rect.height / 2) * .12}px)`;
    });
    item.addEventListener('pointerleave',() => item.style.transform = 'translate(0,0)');
  });

  const parallax = document.querySelector('[data-parallax]');
  document.querySelector('.hero')?.addEventListener('pointermove',event => {
    const x = (event.clientX / innerWidth - .5) * 10;
    const y = (event.clientY / innerHeight - .5) * 10;
    parallax.style.transform = `translate3d(${x}px,${y}px,0)`;
  });
}

const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav a,.mobile-menu nav a').forEach(link => {
  const href = link.getAttribute('href')?.replace('./','');
  if (href === currentPage) link.setAttribute('aria-current','page');
});

const issueDetails = {
  mental: {
    number: '01', tag: 'SAÚDE MENTAL', title: 'CUIDADO MAIS PERTO',
    copy: 'Uma agenda para aproximar prevenção, acolhimento e continuidade do cuidado das pessoas e das famílias.',
    why: 'Saúde mental faz parte da escola, do trabalho, da família e da vida comunitária. O cuidado precisa chegar cedo e continuar perto.',
    items: ['Fortalecer a saúde mental na atenção básica e nas redes municipais.','Apoiar formação contínua para profissionais que atuam na linha de frente.','Defender ações de prevenção em escolas, ambientes de trabalho e comunidades.']
  },
  diabetes: {
    number: '02', tag: 'DIABETES', title: 'INFORMAÇÃO QUE PROTEGE',
    copy: 'Cuidado contínuo depende de informação clara, diagnóstico oportuno e apoio para a vida cotidiana.',
    why: 'O acompanhamento adequado reduz riscos e dá autonomia para quem convive com o diabetes e para toda a sua rede de apoio.',
    items: ['Estimular orientação permanente e diagnóstico precoce.','Apoiar redes regionais de atendimento multiprofissional.','Valorizar associações e famílias na construção das políticas.']
  },
  mulheres: {
    number: '03', tag: 'MULHERES E FAMÍLIAS', title: 'REDE QUE ACOLHE',
    copy: 'Saúde, segurança, trabalho e autonomia precisam ser tratados de maneira conectada.',
    why: 'Mulheres sustentam redes inteiras de cuidado. Políticas integradas podem ampliar proteção, oportunidades e qualidade de vida.',
    items: ['Fortalecer acolhimento para mulheres em situação de vulnerabilidade.','Apoiar saúde mental materna e redes de suporte familiar.','Incentivar qualificação e autonomia econômica nos municípios.']
  },
  infancia: {
    number: '04', tag: 'PRIMEIRA INFÂNCIA', title: 'COMEÇAR BEM MUDA TUDO',
    copy: 'Os primeiros anos exigem atenção coordenada entre família, saúde, educação e assistência.',
    why: 'O começo da vida influencia desenvolvimento, aprendizagem e bem-estar. Cuidar cedo gera impacto por muitas gerações.',
    items: ['Integrar saúde, educação e assistência na primeira infância.','Apoiar orientação prática para mães, pais e cuidadores.','Valorizar iniciativas municipais de desenvolvimento infantil.']
  },
  esporte: {
    number: '05', tag: 'ESPORTE E OPORTUNIDADE', title: 'DISCIPLINA QUE ABRE CAMINHOS',
    copy: 'O esporte pode construir saúde, confiança, convivência e novas perspectivas para crianças e jovens.',
    why: 'Projetos esportivos criam vínculos, previnem riscos e desenvolvem valores que acompanham a pessoa por toda a vida.',
    items: ['Apoiar projetos esportivos ligados à educação e à inclusão.','Valorizar profissionais e organizações das comunidades.','Incentivar participação feminina e acesso seguro ao esporte.']
  },
  voluntariado: {
    number: '06', tag: 'VOLUNTARIADO', title: 'QUEM FAZ PRECISA DE APOIO',
    copy: 'Organizações locais podem ampliar resultados quando encontram apoio responsável, conhecimento e transparência.',
    why: 'O terceiro setor chega a realidades que muitas vezes permanecem invisíveis. Fortalecer essas redes aproxima soluções das pessoas.',
    items: ['Aproximar entidades de capacitação e oportunidades de financiamento.','Estimular gestão, transparência e prestação de contas.','Criar canais de diálogo entre organizações e políticas públicas.']
  }
};

document.querySelectorAll('[data-issue]').forEach(button => button.addEventListener('click', () => {
  const content = issueDetails[button.dataset.issue];
  if (!content) return;
  document.querySelectorAll('[data-issue]').forEach(item => {
    const active = item === button;
    item.classList.toggle('is-active',active);
    item.setAttribute('aria-selected',String(active));
  });
  const fields = {
    '[data-issue-number]': content.number,
    '[data-issue-tag]': content.tag,
    '[data-issue-title]': content.title,
    '[data-issue-copy]': content.copy,
    '[data-issue-why]': content.why
  };
  Object.entries(fields).forEach(([selector,value]) => {
    const node = document.querySelector(selector);
    if (!node) return;
    node.textContent = value;
    node.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'cubic-bezier(.16,1,.3,1)'});
  });
  const list = document.querySelector('[data-issue-list]');
  if (list) {
    list.innerHTML = content.items.map(item => `<li>${item}</li>`).join('');
    list.animate([{opacity:0},{opacity:1}],{duration:420});
  }
}));

const toast = document.querySelector('[data-toast]');
let toastTimer;
const showToast = message => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'),4200);
};

document.querySelector('[data-whatsapp-grupo]')?.addEventListener('click',() => {
  if (!SITE_CONFIG.whatsappGroupUrl) {
    showToast('O convite oficial do grupo ainda será divulgado pela equipe.');
    return;
  }
  window.open(SITE_CONFIG.whatsappGroupUrl,'_blank','noopener');
});

const joinForm = document.querySelector('[data-join-form]');
joinForm?.addEventListener('submit',event => {
  event.preventDefault();
  const required = [...joinForm.querySelectorAll('[required]')];
  required.forEach(field => field.classList.toggle('is-invalid',!field.checkValidity()));
  const invalid = required.find(field => !field.checkValidity());
  if (invalid) {
    invalid.focus();
    showToast('Revise os campos obrigatórios antes de continuar.');
    return;
  }

  const data = new FormData(joinForm);
  const valor = campo => (data.get(campo) || '').toString().trim();
  const mensagem = valor('mensagem');

  const linhas = [
    'Olá! Quero fazer parte da campanha da Bianca Leão 4447.',
    '',
    `Nome: ${valor('nome')}`,
    `Cidade: ${valor('cidade')}`,
    `WhatsApp: ${valor('whatsapp')}`,
    `Como quero participar: ${valor('interesse')}`
  ];
  if (mensagem) linhas.push(`Mensagem: ${mensagem}`);

  const texto = encodeURIComponent(linhas.join(String.fromCharCode(10)));
  const destino = SITE_CONFIG.whatsappNumber
    ? `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${texto}`
    : `https://wa.me/?text=${texto}`;

  const status = joinForm.querySelector('[data-form-status]');
  status.textContent = 'Abrindo o WhatsApp com sua mensagem pronta. É só tocar em enviar.';
  status.classList.add('is-visible');
  joinForm.querySelector('button[type="submit"]').textContent = 'ABRINDO O WHATSAPP...';

  window.open(destino,'_blank','noopener');
});

document.querySelectorAll('[data-download]').forEach(link => link.addEventListener('click',() => {
  showToast('Download iniciado. A figurinha 4447 já está pronta para compartilhar.');
}));
