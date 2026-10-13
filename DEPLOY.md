# Deploy · Bianca Leão, psicóloga

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

## 5. Virada da campanha para o consultório

O `netlify.toml` já redireciona os endereços antigos da campanha (301):
`/participe` vai para `/agendar.html`, `/pautas` para `/atendimento.html`, e
`/gerador` e `/figurinhas` para o início. Assim nenhum link que circulou nos grupos
cai na página de erro.

## Pendências antes de publicar

- [ ] Confirmar com a Bianca o endereço do consultório e preencher
      `SITE_CONFIG.address` em `dist/script.js`.
- [ ] Confirmar duração das sessões (o site diz cerca de 50 minutos), política de
      remarcação e se emite recibo para reembolso de plano de saúde.
- [ ] Confirmar o cadastro no e-Psi (exigido pelo CFP para atendimento on-line).
- [ ] Revisar os textos em primeira pessoa da página Sobre com a Bianca.
- [ ] Confirmar com a Bianca o uso dos dois vídeos do Instagram no site.
- [ ] Trocar os retratos recortados por fotos profissionais do consultório, quando
      houver.
- [ ] Criar a property GA4 e preencher `GA_MEASUREMENT_ID` em `dist/analytics.js`.
