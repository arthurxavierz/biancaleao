# Deploy — Bianca Leão 4447

Padrão Achilles Media: **GitHub → Netlify → Cloudflare DNS**.
Supabase não é usado neste projeto (o formulário abre o WhatsApp, não grava nada).

Domínio provisório: `biancaleao.achillesmedia.com.br`
Domínio definitivo (quando validado): `biancaleao.com.br`

---

## 1. GitHub

```bash
git init
git add .
git commit -m "chore: configuração inicial de deploy"
git branch -M main
git remote add origin https://github.com/arthurxavierz/biancaleao.git
git push -u origin main
```

Repositório: https://github.com/arthurxavierz/biancaleao

---

## 2. Netlify

1. **Add new site → Import an existing project → GitHub** → selecione o repositório.
2. As configurações de build vêm do `netlify.toml` — não altere no painel:
   - Build command: *(vazio)*
   - Publish directory: `dist`
3. Deploy. O site sobe em `<nome-aleatorio>.netlify.app`.
4. **Site settings → General → Site name:** renomeie para `bianca-leao-4447`
   (fica `biancaleao.netlify.app` — use esse nome no CNAME abaixo).

O `netlify.toml` já entrega:
- headers de segurança (HSTS, nosniff, frame-options, permissions-policy);
- cache imutável em `/assets/*` e revalidação em HTML (deploy novo aparece na hora);
- URLs limpas (`/pautas` serve `/pautas.html`);
- `404.html` como página de erro.

---

## 3. Cloudflare (DNS)

Na zona `achillesmedia.com.br`:

| Tipo  | Nome         | Conteúdo                        | Proxy         |
|-------|--------------|---------------------------------|---------------|
| CNAME | `biancaleao` | `biancaleao.netlify.app`  | **DNS only** ☁️ cinza |

> **Importante:** deixe o proxy **desligado** (nuvem cinza). Com o proxy laranja, o
> Netlify não consegue emitir/renovar o certificado Let's Encrypt e o site cai em
> erro de SSL. O Netlify já entrega CDN e HTTPS próprios.

Depois, no Netlify: **Domain management → Add a domain** → `biancaleao.achillesmedia.com.br`
→ aguarde o certificado (alguns minutos) → **Force HTTPS**.

---

## 4. Quando comprar o domínio definitivo

1. Aponte `biancaleao.com.br` para o Cloudflare (nameservers no registro.br).
2. Na zona nova, crie:
   - `CNAME  www  bianca-leao-4447.netlify.app`  (DNS only)
   - `CNAME  @    bianca-leao-4447.netlify.app`  (DNS only — o Cloudflare resolve o
     CNAME flattening na raiz automaticamente)
3. No Netlify, defina `biancaleao.com.br` como **primary domain** e mantenha o
   subdomínio provisório como alias (o Netlify redireciona sozinho).
4. **No código, troque o domínio nos 3 lugares:**
   ```bash
   # do diretório do projeto
   grep -rl "biancaleao.achillesmedia.com.br" dist/ | \
     xargs sed -i 's|biancaleao.achillesmedia.com.br|biancaleao.com.br|g'
   ```
   Isso atualiza `canonical`, `og:url`, `og:image`, `robots.txt` e `sitemap.xml`.

---

---

## 5. Gerador de fotos (segundo site, mesmo repositório)

A pasta `gerador/` é um site independente, publicado com outro endereço:

Domínio provisório: `gerador.biancaleao.achillesmedia.com.br`
Domínio definitivo (quando validado): `gerador.biancaleao.com.br`

### Netlify

1. **Add new site → Import an existing project → GitHub** → selecione o **mesmo**
   repositório `arthurxavierz/biancaleao`.
2. Na tela de configuração, defina:
   - **Base directory:** `gerador`
   - **Build command:** *(vazio)*
   - **Publish directory:** `gerador/dist`

   Com a base directory preenchida, o Netlify lê `gerador/netlify.toml` e ignora
   o `netlify.toml` da raiz. Os dois sites convivem sem interferência.
3. Deploy. **Site settings → General → Site name:** renomeie para
   `gerador-bianca-leao`.

### Cloudflare (DNS)

Na zona `achillesmedia.com.br`:

| Tipo  | Nome                  | Conteúdo                            | Proxy                 |
|-------|-----------------------|-------------------------------------|-----------------------|
| CNAME | `gerador.biancaleao`  | `gerador-bianca-leao.netlify.app`   | **DNS only** ☁️ cinza |

Mesma regra do site principal: proxy desligado, senão o certificado do Netlify
não é emitido. Depois, no Netlify: **Domain management → Add a domain** →
`gerador.biancaleao.achillesmedia.com.br` → aguarde o certificado → **Force HTTPS**.

### Observações

- Não há back-end. A foto do apoiador é montada no próprio aparelho e nada é
  enviado para a internet, então não há dado pessoal armazenado.
- Molduras, cores, número e slogan ficam em `gerador/dist/campanha.js`.
- A cada deploy que mexer em CSS ou JS, suba o `?v=N` dos links no
  `gerador/dist/index.html`.

## Pendências antes de divulgar

- [ ] Preencher `SITE_CONFIG.whatsappNumber` em `dist/script.js`.
- [ ] Criar a property GA4 deste site e preencher `GA_MEASUREMENT_ID` em
      `dist/analytics.js` (enquanto vazio, nenhum script de rastreio carrega).
- [ ] Preencher `SITE_CONFIG.whatsappGroupUrl` quando o grupo existir.
- [ ] Conferir com o jurídico da campanha se a identificação no rodapé
      (Federação União Progressista — União Brasil, CNPJ 68.468.267/0001-41,
      extraída das artes oficiais) está completa para a legislação eleitoral.
- [ ] Substituir as fotos de prototipação por fotos oficiais em alta, quando
      houver (ver seção Imagens do README).
