/* ------------------------------------------------------------------
   Google Analytics 4 — padrão Achilles Media.
   Cole abaixo o ID da property criada para ESTE site (formato G-XXXXXXXXXX).
   Enquanto estiver vazio, nada é carregado e nenhum cookie é criado.
------------------------------------------------------------------ */
const GA_MEASUREMENT_ID = '';

if (GA_MEASUREMENT_ID) {
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(tag);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
}
