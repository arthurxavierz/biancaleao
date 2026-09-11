"""
Gera os assets de imagem do site a partir dos arquivos em originais/.

Rode a partir da raiz do repositorio:

    python tools/build-images.py

Os recortes removem o texto sobreposto das artes de campanha, deixando
apenas o retrato. Saida em dist/assets/fotos/, em WebP responsivo.
"""
from PIL import Image
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ORIG = RAIZ / "originais"
DEST = RAIZ / "dist" / "assets" / "fotos"
DEST.mkdir(parents=True, exist_ok=True)

# (arquivo, recorte ou None, nome de saida, larguras)
RECORTES = [
    ("card-independencia.jpg", (450, 60, 1060, 1200),  "retrato-hero",    [640, 960, 1280]),
    ("card-etica.jpg",         (790, 180, 1440, 1290), "retrato-sorriso", [480, 720]),
    ("card-psicologa.jpg",     (790, 350, 1440, 1520), "retrato-cafe",    [480, 720]),
    ("bianca-rua.jpg",         None,                   "bianca-rua",      [640, 960]),
    # artes completas, para a galeria de campanha
    ("card-independencia.jpg", None, "card-independencia", [420, 840]),
    ("card-psicologa.jpg",     None, "card-psicologa",     [420, 840]),
    ("card-etica.jpg",         None, "card-etica",         [420, 840]),
]

for arquivo, caixa, nome, larguras in RECORTES:
    base = Image.open(ORIG / arquivo).convert("RGB")
    if caixa:
        base = base.crop(caixa)
    for largura in larguras:
        img = base.copy()
        altura = round(largura * base.height / base.width)
        img = img.resize((largura, altura), Image.LANCZOS)
        saida = DEST / f"{nome}-{largura}.webp"
        img.save(saida, "WEBP", quality=82, method=6)
        print(f"{saida.name:<32} {largura}x{altura}  {saida.stat().st_size/1024:.0f}KB")

# ---------------------------------------------------------------
# Imagem de compartilhamento (Open Graph), 1200x630.
# ---------------------------------------------------------------
from PIL import ImageDraw, ImageFont

AZUL, AMARELO, BRANCO = "#0654d6", "#ffdf10", "#ffffff"
og = Image.new("RGB", (1200, 630), AZUL)

# retrato ocupando o terco direito
retrato = Image.open(ORIG / "card-independencia.jpg").convert("RGB").crop((450, 60, 1060, 1200))
escala = 630 / retrato.height
retrato = retrato.resize((round(retrato.width * escala), 630), Image.LANCZOS)
og.paste(retrato, (1200 - retrato.width, 0))

# faixa amarela vertical separando texto e foto
d = ImageDraw.Draw(og)
d.rectangle([1200 - retrato.width - 14, 0, 1200 - retrato.width - 2, 630], fill=AMARELO)

def fonte(caminho, tamanho):
    return ImageFont.truetype(f"C:/Windows/Fonts/{caminho}", tamanho)

d.text((70, 150), "DEPUTADA FEDERAL", font=fonte("arialbd.ttf", 30), fill=AMARELO)
d.text((70, 200), "BIANCA",  font=fonte("ariblk.ttf", 92), fill=BRANCO)
d.text((70, 300), "LEÃO",    font=fonte("ariblk.ttf", 92), fill=BRANCO)
d.text((70, 400), "4447",    font=fonte("ariblk.ttf", 120), fill=AMARELO)
d.text((70, 556), "MINAS GERAIS", font=fonte("arialbd.ttf", 28), fill=BRANCO)

og.save(RAIZ / "dist" / "assets" / "og-bianca-leao.jpg", "JPEG", quality=88, optimize=True)
print("og-bianca-leao.jpg              1200x630")
