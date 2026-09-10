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
git remote add origin git@github.com:<org-achilles>/bianca-leao-4447.git
git push -u origin main
```

Repositório **privado** até a validação da candidata.

---

## 2. Netlify

1. **Add new site → Import an existing project → GitHub** → selecione o repositório.
2. As configurações de build vêm do `netlify.toml` — não altere no painel:
   - Build command: *(vazio)*
   - Publish directory: `dist`
3. Deploy. O site sobe em `<nome-aleatorio>.netlify.app`.
4. **Site settings → General → Site name:** renomeie para `bianca-leao-4447`
   (fica `bianca-leao-4447.netlify.app` — use esse nome no CNAME abaixo).

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
| CNAME | `biancaleao` | `bianca-leao-4447.netlify.app`  | **DNS only** ☁️ cinza |

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

## Pendências antes de divulgar

- [ ] Preencher `SITE_CONFIG.whatsappNumber` em `dist/script.js`.
- [ ] Preencher `SITE_CONFIG.whatsappGroupUrl` quando o grupo existir.
- [ ] Criar `dist/assets/og-bianca-leao.jpg` (1200×630) — a imagem de
      compartilhamento já está referenciada em todas as páginas, mas o arquivo
      ainda não existe.
- [ ] Confirmar com o jurídico da campanha se o rodapé precisa exibir CNPJ da
      campanha / número de registro da candidatura (exigência da legislação eleitoral).
