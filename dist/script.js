/* ------------------------------------------------------------------
   CONFIGURAÇÃO DO CONSULTÓRIO
   Único lugar a editar para atualizar contatos e endereço.
   - whatsappNumber: 55 + DDD + número, apenas dígitos.
   - whatsappDisplay: o número como aparece escrito no site.
   - address: endereço completo do consultório. Enquanto estiver vazio,
     o site mostra apenas a cidade e o mapa centraliza em Patrocínio.
------------------------------------------------------------------ */
const SITE_CONFIG = {
  whatsappNumber: '5534997118991',
  whatsappDisplay: '(34) 99711-8991',
  instagram: 'psicologabiancaleao',
  city: 'Patrocínio, MG',
  address: ''
};

const body = document.body;
const loader = document.querySelector('.intro-loader');
const header = document.querySelector('[data-header]');
const progress = document.querySelector('.page-progress span');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const cursorGlow = document.querySelector('.cursor-glow');
const modal = document.querySelector('[data-modal]');

const whatsappLink = text => `https://wa.me/${SITE_CONFIG.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

/* Abertura e rolagem ------------------------------------------------ */
const finishLoading = () => window.setTimeout(() => loader?.classList.add('is-finished'), 900);
if (document.readyState === 'complete') finishLoading();
else window.addEventListener('load', finishLoading, { once: true });

const updateScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  header?.classList.toggle('is-scrolled', scrollY > 22);
};
addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

/* Menu do celular --------------------------------------------------- */
const closeMenu = () => {
  body.classList.remove('menu-open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menu');
};
menuButton?.addEventListener('click', () => {
  const open = body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

/* Entrada dos blocos ------------------------------------------------ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -35px' });
document.querySelectorAll('.reveal').forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 4, 3) * 65}ms`;
  observer.observe(item);
});

/* Contatos preenchidos a partir da configuração --------------------- */
document.querySelectorAll('[data-whatsapp]').forEach(link => {
  link.href = whatsappLink(link.dataset.whatsapp || 'Olá, Bianca! Vim pelo site e gostaria de informações sobre o atendimento.');
  link.target = '_blank';
  link.rel = 'noopener';
});
document.querySelectorAll('[data-whatsapp-display]').forEach(node => { node.textContent = SITE_CONFIG.whatsappDisplay; });
document.querySelectorAll('[data-address]').forEach(node => {
  node.textContent = SITE_CONFIG.address || SITE_CONFIG.city;
});
document.querySelectorAll('[data-address-note]').forEach(node => {
  node.textContent = SITE_CONFIG.address
    ? SITE_CONFIG.city
    : 'O endereço completo é enviado na confirmação do horário.';
});
document.querySelectorAll('[data-map]').forEach(frame => {
  const query = encodeURIComponent(SITE_CONFIG.address || SITE_CONFIG.city);
  frame.src = `https://www.google.com/maps?q=${query}&z=${SITE_CONFIG.address ? 16 : 13}&output=embed`;
});
document.querySelectorAll('[data-route]').forEach(link => {
  link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE_CONFIG.address || SITE_CONFIG.city)}`;
});

/* Áreas de cuidado: filtro e detalhes ------------------------------- */
const areas = {
  ansiedade: {
    number: '01', tag: 'ANSIEDADE E ESTRESSE', title: 'Quando a cabeça não desliga',
    copy: 'Preocupação constante, aperto no peito, sono leve, a sensação de estar sempre atrasada para alguma coisa. A terapia ajuda a entender de onde isso vem e a construir formas mais gentis de lidar com o que aperta.',
    signs: ['Pensamentos acelerados e dificuldade para relaxar.', 'Cansaço que não passa com descanso.', 'Irritação, tensão no corpo ou crises de choro sem motivo claro.']
  },
  autoestima: {
    number: '02', tag: 'AUTOESTIMA', title: 'Fazer as pazes com quem você é',
    copy: 'A forma como você se enxerga influencia escolhas, relações e o quanto se permite viver. Na terapia, olhamos para essa voz interna com cuidado, sem pressa e sem julgamento.',
    signs: ['Comparação frequente com outras pessoas.', 'Dificuldade em dizer não ou em reconhecer as próprias conquistas.', 'Autocrítica que pesa mais do que ajuda.']
  },
  relacoes: {
    number: '03', tag: 'RELACIONAMENTOS', title: 'Vínculos que fazem bem',
    copy: 'Namoro, casamento, família, amizades, trabalho. Entender os próprios padrões é o primeiro passo para construir relações com mais diálogo, limites claros e menos desgaste.',
    signs: ['Conflitos que se repetem com pessoas diferentes.', 'Medo de abandono ou de decepcionar.', 'Dificuldade para colocar limites.']
  },
  maternidade: {
    number: '04', tag: 'MATERNIDADE', title: 'Mãe também precisa de colo',
    copy: 'Gestação, puerpério e a rotina com filhos trazem alegrias e também cansaço, culpa e mudanças de identidade. Como mãe, Bianca conhece esse caminho de perto e oferece um espaço para você ser escutada.',
    signs: ['Sobrecarga e sensação de estar sozinha.', 'Culpa por não dar conta de tudo.', 'Tristeza ou ansiedade depois do nascimento do bebê.']
  },
  diabetes: {
    number: '05', tag: 'SAÚDE EMOCIONAL E DIABETES', title: 'Viver bem com uma condição crônica',
    copy: 'Bianca convive com o diabetes tipo 1 e sabe o quanto contar carboidratos, medir a glicose e lidar com o olhar dos outros pesa no emocional. A terapia acolhe esse cansaço e ajuda a cuidar da saúde sem que ela vire a vida inteira.',
    signs: ['Esgotamento com a rotina de cuidados.', 'Medo de complicações ou de hipoglicemias.', 'Dificuldade de aceitar o diagnóstico, seu ou de alguém da família.']
  },
  adolescencia: {
    number: '06', tag: 'ADOLESCÊNCIA', title: 'Crescer dá trabalho',
    copy: 'Mudanças no corpo, escola, amizades, redes sociais e as primeiras grandes escolhas. O atendimento de adolescentes oferece um espaço próprio para o jovem, com a participação dos responsáveis quando é importante.',
    signs: ['Isolamento ou mudanças bruscas de humor.', 'Queda no rendimento escolar.', 'Ansiedade com provas, aparência ou aceitação.']
  }
};

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => {
    item.classList.toggle('is-active', item === button);
    item.setAttribute('aria-selected', String(item === button));
  });
  document.querySelectorAll('[data-category]').forEach(card => card.classList.toggle('is-hidden', filter !== 'all' && !card.dataset.category.split(' ').includes(filter)));
}));

const openArea = key => {
  const content = areas[key];
  if (!content || !modal) return;
  modal.querySelector('[data-modal-number]').textContent = content.number;
  modal.querySelector('[data-modal-tag]').textContent = content.tag;
  modal.querySelector('[data-modal-title]').textContent = content.title;
  modal.querySelector('[data-modal-copy]').textContent = content.copy;
  modal.querySelector('[data-modal-list]').innerHTML = content.signs.map(item => `<li>${item}</li>`).join('');
  modal.querySelector('[data-modal-cta]').href = `./agendar.html?tema=${key}`;
  modal.showModal();
  body.classList.add('modal-open');
};
document.querySelectorAll('[data-area]').forEach(button => button.addEventListener('click', () => openArea(button.dataset.area)));
const closeModal = () => { modal?.close(); body.classList.remove('modal-open'); };
document.querySelector('[data-modal-close]')?.addEventListener('click', closeModal);
modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
modal?.addEventListener('close', () => body.classList.remove('modal-open'));

/* Como funciona ----------------------------------------------------- */
const steps = {
  contato: ['01', 'O primeiro contato', 'Você preenche o formulário ou chama no WhatsApp. Bianca responde com os horários disponíveis, valores e as orientações para a primeira sessão.'],
  sessao: ['02', 'A primeira sessão', 'Um encontro para se conhecerem. Você conta o que te trouxe até aqui, no seu tempo, e vocês combinam juntos como seguir.'],
  processo: ['03', 'O acompanhamento', 'Sessões regulares, em geral semanais, num espaço seguro e sigiloso. O processo é revisto com você ao longo do caminho.']
};
document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => {
  const content = steps[button.dataset.step];
  document.querySelectorAll('[data-step]').forEach(item => item.classList.toggle('is-active', item === button));
  const nodes = [document.querySelector('[data-step-index]'), document.querySelector('[data-step-title]'), document.querySelector('[data-step-copy]')];
  nodes.forEach((node, index) => {
    if (!node) return;
    node.textContent = content[index];
    node.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
  });
}));

/* Vídeos: a capa vira o botão de play e volta ao fim ---------------- */
document.querySelectorAll('[data-video]').forEach(frame => {
  const video = frame.querySelector('video');
  const play = frame.querySelector('[data-video-play]');
  if (!video || !play) return;
  play.addEventListener('click', () => {
    document.querySelectorAll('[data-video] video').forEach(other => { if (other !== video) other.pause(); });
    video.controls = true;
    frame.classList.add('is-playing');
    const tentativa = video.play();
    if (tentativa?.catch) tentativa.catch(() => {});
    video.focus({ preventScroll: true });
  });
  video.addEventListener('ended', () => {
    frame.classList.remove('is-playing');
    video.controls = false;
    video.currentTime = 0;
  });
});

/* Movimento fino no computador -------------------------------------- */
if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  addEventListener('pointermove', event => {
    if (!cursorGlow) return;
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  }, { passive: true });

  document.querySelectorAll('.magnetic').forEach(item => {
    item.addEventListener('pointermove', event => {
      const rect = item.getBoundingClientRect();
      item.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .12}px,${(event.clientY - rect.top - rect.height / 2) * .12}px)`;
    });
    item.addEventListener('pointerleave', () => { item.style.transform = 'translate(0,0)'; });
  });

  const parallax = document.querySelector('[data-parallax]');
  document.querySelector('.hero')?.addEventListener('pointermove', event => {
    if (!parallax) return;
    const x = (event.clientX / innerWidth - .5) * 10;
    const y = (event.clientY / innerHeight - .5) * 10;
    parallax.style.transform = `translate3d(${x}px,${y}px,0)`;
  });
}

/* Página atual no menu ---------------------------------------------- */
const currentPage = location.pathname.split('/').pop().replace('.html', '') || 'index';
document.querySelectorAll('.nav a,.mobile-menu nav a').forEach(link => {
  const href = link.getAttribute('href')?.replace('./', '').replace('.html', '');
  if (href === currentPage) link.setAttribute('aria-current', 'page');
});

/* Aviso rápido ------------------------------------------------------ */
const toast = document.querySelector('[data-toast]');
let toastTimer;
const showToast = message => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4200);
};

/* Agendamento pelo WhatsApp ----------------------------------------- */
const form = document.querySelector('[data-schedule-form]');
if (form) {
  const temas = { ansiedade: 'Ansiedade e estresse', autoestima: 'Autoestima', relacoes: 'Relacionamentos', maternidade: 'Maternidade', diabetes: 'Saúde emocional e diabetes', adolescencia: 'Adolescência' };
  const tema = new URLSearchParams(location.search).get('tema');
  const temaField = form.querySelector('[name="tema"]');
  if (tema && temas[tema] && temaField) temaField.value = temas[tema];

  const phone = form.querySelector('[name="whatsapp"]');
  phone?.addEventListener('input', () => {
    const d = phone.value.replace(/\D/g, '').slice(0, 11);
    phone.value = d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`
      : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const required = [...form.querySelectorAll('[required]')];
    required.forEach(field => field.classList.toggle('is-invalid', !field.checkValidity()));

    const groups = [...form.querySelectorAll('[data-required-group]')];
    const emptyGroup = groups.find(group => !group.querySelector('input:checked'));
    groups.forEach(group => group.classList.toggle('is-invalid', !group.querySelector('input:checked')));

    const invalid = required.find(field => !field.checkValidity());
    if (invalid || emptyGroup) {
      (invalid || emptyGroup.querySelector('input'))?.focus();
      showToast('Faltou preencher algum campo. Confira os itens destacados.');
      return;
    }

    const data = new FormData(form);
    const valor = campo => (data.get(campo) || '').toString().trim();
    const varios = campo => data.getAll(campo).join(', ');

    const linhas = [
      'Olá, Bianca! Vim pelo site e gostaria de agendar uma consulta.',
      '',
      `Nome: ${valor('nome')}`,
      `WhatsApp: ${valor('whatsapp')}`,
      `Atendimento para: ${valor('para')}`,
      `Modalidade: ${valor('modalidade')}`,
      `Dias de preferência: ${varios('dias')}`,
      `Período: ${varios('periodo')}`,
      `Já fez terapia antes: ${valor('experiencia')}`
    ];
    if (valor('tema')) linhas.push(`Tema: ${valor('tema')}`);
    if (valor('mensagem')) linhas.push(`Observação: ${valor('mensagem')}`);

    const destino = whatsappLink(linhas.join('\n'));
    const status = form.querySelector('[data-form-status]');
    status.innerHTML = 'Sua mensagem está pronta. Se o WhatsApp não abrir sozinho, toque no botão abaixo.';
    const abrir = document.createElement('a');
    abrir.className = 'join-form__open';
    abrir.href = destino;
    abrir.target = '_blank';
    abrir.rel = 'noopener';
    abrir.textContent = 'ABRIR O WHATSAPP';
    status.append(abrir);
    status.classList.add('is-visible');
    window.open(destino, '_blank', 'noopener');
  });
}
