"""
Gera as figurinhas de WhatsApp a partir das fotos em originais/.

    python tools/build-stickers.py

Cada figurinha sai em 512x512 WebP com fundo transparente e contorno
branco, como o WhatsApp espera. O rosto entra num circulo, para nunca
ser cortado pelo texto, e as cores sao as da campanha.

Para mudar frases, cores ou enquadramento, edite FIGURINHAS no fim.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ORIG = RAIZ / "originais"
DEST = RAIZ / "dist" / "assets" / "figurinhas"
DEST.mkdir(parents=True, exist_ok=True)

LADO, RAIO, BORDA = 512, 76, 12
RAIO_FOTO = 130
CENTRO_FOTO = (256, 176)
# as duas linhas ficam centradas nestas alturas, entao nunca vazam para fora
LINHAS_Y = (372, 438)

AZUL       = (6, 84, 214)
AZUL_FUNDO = (6, 31, 98)
AMARELO    = (255, 223, 16)
CIANO      = (18, 217, 231)
BRANCO     = (255, 255, 255)


def fonte(arquivo, tamanho):
    return ImageFont.truetype(f"C:/Windows/Fonts/{arquivo}", tamanho)


def medir(d, texto, f):
    a, _, b, _ = d.textbbox((0, 0), texto, font=f)
    return b - a


def fonte_que_cabe(d, texto, limite, tamanho_maximo):
    """Diminui a fonte ate a linha caber, para nenhuma frase estourar."""
    t = tamanho_maximo
    while t > 14:
        f = fonte("ariblk.ttf", t)
        if medir(d, texto, f) <= limite:
            return f
        t -= 2
    return fonte("ariblk.ttf", 14)


def foto_circular(arquivo, caixa):
    img = Image.open(ORIG / arquivo).convert("RGB").crop(caixa)
    lado = min(img.width, img.height)
    e, t = (img.width - lado) // 2, (img.height - lado) // 2
    img = img.crop((e, t, e + lado, t + lado)).resize((RAIO_FOTO * 2, RAIO_FOTO * 2), Image.LANCZOS)
    mascara = Image.new("L", img.size, 0)
    ImageDraw.Draw(mascara).ellipse([0, 0, img.size[0] - 1, img.size[1] - 1], fill=255)
    img.putalpha(mascara)
    return img


def monta(arquivo, caixa, linhas, cor_fundo, cor_texto, cor_destaque, saida):
    fig = Image.new("RGBA", (LADO, LADO), cor_fundo + (255,))
    d = ImageDraw.Draw(fig)

    # anel decorativo, no espirito das artes da campanha
    d.ellipse([-130, -170, 250, 210], outline=cor_destaque + (55,), width=16)
    d.ellipse([320, -90, 650, 240], outline=cor_destaque + (38,), width=20)

    # aro atras da foto e a foto
    cx, cy = CENTRO_FOTO
    d.ellipse([cx - RAIO_FOTO - 9, cy - RAIO_FOTO - 9, cx + RAIO_FOTO + 9, cy + RAIO_FOTO + 9],
              fill=BRANCO + (255,))
    foto = foto_circular(arquivo, caixa)
    fig.paste(foto, (cx - RAIO_FOTO, cy - RAIO_FOTO), foto)

    # frase: cada linha centrada na sua altura, com a fonte reduzida
    # ate caber na largura. Assim nada escapa da figurinha.
    limite = LADO - 72
    for i, linha in enumerate(linhas[:2]):
        ultima = i == len(linhas) - 1
        f = fonte_que_cabe(d, linha, limite, 62 if ultima else 46)
        d.text((LADO / 2, LINHAS_Y[i]), linha, font=f, anchor="mm",
               fill=(cor_destaque if ultima else cor_texto) + (255,))

    # recorte arredondado + contorno branco
    mascara = Image.new("L", (LADO, LADO), 0)
    ImageDraw.Draw(mascara).rounded_rectangle([0, 0, LADO - 1, LADO - 1], RAIO, fill=255)
    fig.putalpha(mascara)

    contorno = Image.new("RGBA", (LADO, LADO), (0, 0, 0, 0))
    ImageDraw.Draw(contorno).rounded_rectangle(
        [BORDA // 2, BORDA // 2, LADO - 1 - BORDA // 2, LADO - 1 - BORDA // 2],
        RAIO - BORDA // 2, outline=BRANCO + (255,), width=BORDA)
    fig = Image.alpha_composite(fig, contorno)

    fig.save(DEST / saida, "WEBP", quality=90, method=6)
    print(f"{saida:<18} {(DEST / saida).stat().st_size / 1024:.0f}KB")


# arquivo, recorte do rosto, linhas, fundo, cor do texto, cor de destaque, saida
FIGURINHAS = [
    ("card-etica.jpg",         (820, 250, 1440, 1070), ["EU TÔ COM", "BIANCA 4447"], AZUL,       BRANCO,     AMARELO, "bianca-01.webp"),
    ("card-independencia.jpg", (560, 80, 1070, 670),  ["VOTE", "4447"],             AMARELO,    AZUL_FUNDO, AZUL,    "bianca-02.webp"),
    ("card-psicologa.jpg",     (860, 380, 1360, 920), ["CUIDAR", "É FAZER"],        AZUL_FUNDO, BRANCO,     CIANO,   "bianca-03.webp"),
    ("bianca-rua.jpg",         (380, 100, 960, 780),  ["DE PERTINHO,", "POR MINAS"], AMARELO,   AZUL_FUNDO, AZUL,    "bianca-04.webp"),
    ("card-etica.jpg",         (820, 250, 1440, 1070), ["BORA COM", "A BIANCA"],     CIANO,      AZUL_FUNDO, AZUL,    "bianca-05.webp"),
    ("card-independencia.jpg", (560, 80, 1070, 670),  ["MINAS COM", "BIANCA 4447"], AZUL,       BRANCO,     AMARELO, "bianca-06.webp"),
]

for args in FIGURINHAS:
    monta(*args)

# ---------------------------------------------------------------
# Pacote completo, oferecido na pagina como download unico.
# ---------------------------------------------------------------
import zipfile

pacote = RAIZ / "dist" / "assets" / "figurinhas-bianca-4447.zip"
with zipfile.ZipFile(pacote, "w", zipfile.ZIP_DEFLATED) as z:
    for _, _, _, _, _, _, nome in FIGURINHAS:
        z.write(DEST / nome, nome)
print(f"{'pacote .zip':<18} {pacote.stat().st_size / 1024:.0f}KB")
