"""Gera as imagens tratadas usadas no site do consultório.

Recortes: remove o fundo das fotos para que o retrato assente sobre a paleta
do consultório, e grava cada recorte em WebP com transparência nas larguras
usadas pelo srcset.

Fotos: recorta e ajusta o tom de fotos que entram inteiras, em retângulo.

    pip install rembg onnxruntime scipy pillow
    python tools/build-consultorio.py
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance
from rembg import new_session, remove
from scipy import ndimage

RAIZ = Path(__file__).resolve().parent.parent
FOTOS = RAIZ / "dist" / "assets" / "fotos"
ORIGINAIS = RAIZ / "originais"
DESTINO = RAIZ / "dist" / "assets" / "consultorio"

# Cada recorte:
#   origem   arquivo de entrada
#   nome     prefixo dos arquivos gerados
#   larguras larguras do srcset
#   caixa    recorte prévio (esquerda, topo, direita, base), opcional
#   campanha apaga restos do azul e amarelo da campanha
#   letreiro cor do letreiro manuscrito a apagar e áreas do corpo protegidas
RECORTES = [
    {"origem": FOTOS / "retrato-hero-1280.webp", "nome": "bianca-retrato", "larguras": (520, 800, 1100), "campanha": True},
    {"origem": FOTOS / "retrato-sorriso-720.webp", "nome": "bianca-sorriso", "larguras": (480, 720), "campanha": True},
    {"origem": FOTOS / "retrato-cafe-720.webp", "nome": "bianca-cafe", "larguras": (480, 720), "campanha": True},
    # Post com caixa de texto rosa no canto: a caixa fica de fora pelo corte.
    {"origem": ORIGINAIS / "bianca-oculos.jpg", "nome": "bianca-oculos", "larguras": (520, 820), "caixa": (0, 0, 1350, 1200)},
    # Post lilás com a palavra "psicóloga" escrita atrás do cabelo.
    {"origem": ORIGINAIS / "bianca-lilas.jpg", "nome": "bianca-lilas", "larguras": (520, 820), "caixa": (560, 250, 1440, 1440),
     "letreiro": {"cor": (233, 197, 189), "protege": [(400, 220, 740, 1190), (280, 510, 880, 1190), (310, 360, 410, 510)]}},
]

# Fotos inteiras, com leve ajuste de tom para conversar com a paleta.
FOTOS_INTEIRAS = [
    {"origem": ORIGINAIS / "bianca-oculos.jpg", "nome": "bianca-leitura", "larguras": (560, 900), "caixa": (230, 0, 1350, 1200)},
]


def limpar_cores(rgba: np.ndarray) -> None:
    """Apaga restos das cores da campanha (azul forte, marinho e amarelo).

    O blazer é azul claro e pouco saturado, e o cabelo é dourado com matiz
    abaixo de 45 graus, então os dois ficam fora destes intervalos.
    """
    rgb = rgba[..., :3].astype(np.float32) / 255
    hsv = np.array(Image.fromarray(rgba[..., :3]).convert("HSV")).astype(np.float32)
    hue = hsv[..., 0] * 360 / 255
    sat = hsv[..., 1] / 255
    val = rgb.max(axis=-1)
    azul = (hue > 205) & (hue < 240) & (sat > .5) & (val > .15)
    amarelo = (hue > 47) & (hue < 66) & (sat > .62) & (val > .6)
    lixo = ndimage.binary_dilation(azul | amarelo, iterations=2)
    rgba[..., 3][lixo] = 0


def limpar_letreiro(rgba: np.ndarray, original: np.ndarray, cor, protege) -> None:
    """Apaga traços de letreiro de cor próxima à informada.

    O rosto, o colo e o brinco têm tons parecidos com o rosa do letreiro, por
    isso ficam em caixas protegidas (esquerda, topo, direita, base).
    """
    distancia = np.sqrt(((original.astype(int) - np.array(cor)) ** 2).sum(-1))
    letra = distancia < 34
    yy, xx = np.mgrid[: letra.shape[0], : letra.shape[1]]
    guarda = np.zeros_like(letra)
    for x0, y0, x1, y1 in protege:
        guarda |= (xx > x0) & (xx < x1) & (yy > y0) & (yy < y1)
    letra = ndimage.binary_dilation(letra & ~guarda, iterations=3) & ~guarda
    rgba[..., 3][letra] = 0


def limpar_alpha(rgba: np.ndarray) -> Image.Image:
    """Mantém só a maior mancha do recorte, apagando respingos do fundo."""
    alpha = rgba[..., 3]
    rotulos, total = ndimage.label(alpha > 24)
    if total > 1:
        tamanhos = ndimage.sum(np.ones_like(alpha), rotulos, range(1, total + 1))
        maior = int(np.argmax(tamanhos)) + 1
        mascara = ndimage.binary_dilation(rotulos == maior, iterations=3)
        alpha[~mascara] = 0
    rgba[..., 3] = (alpha * esfumar(*alpha.shape)).astype(np.uint8)
    return Image.fromarray(rgba)


def esfumar(altura: int, largura: int, borda: float = .09) -> np.ndarray:
    """Suaviza as laterais e o topo, onde a foto original foi cortada.

    Sem isso o corte da foto aparece como uma linha reta dentro do arco.
    """
    x = np.linspace(0, 1, largura)
    lados = np.clip(np.minimum(x, 1 - x) / borda, 0, 1)
    y = np.linspace(0, 1, altura)
    topo = np.clip(y / (borda * .5), 0, 1)
    suave = lambda t: t * t * (3 - 2 * t)
    return suave(topo)[:, None] * suave(lados)[None, :]


def tom_do_consultorio(foto: Image.Image) -> Image.Image:
    """Esfria um pouco a foto e baixa a saturação, na direção do azul da paleta."""
    foto = ImageEnhance.Color(foto).enhance(.88)
    rgb = np.asarray(foto).astype(np.float32)
    rgb[..., 0] *= .985
    rgb[..., 2] = np.minimum(rgb[..., 2] * 1.03 + 2, 255)
    return Image.fromarray(rgb.clip(0, 255).astype(np.uint8))


def gravar(imagem: Image.Image, nome: str, larguras) -> None:
    for largura in larguras:
        altura = round(imagem.height * largura / imagem.width)
        saida = DESTINO / f"{nome}-{largura}.webp"
        imagem.resize((largura, altura), Image.LANCZOS).save(saida, "WEBP", quality=84, method=6)
        print(saida.relative_to(RAIZ))


def abrir(item) -> Image.Image:
    foto = Image.open(item["origem"]).convert("RGB")
    return foto.crop(item["caixa"]) if "caixa" in item else foto


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    sessao = new_session("isnet-general-use")
    for item in RECORTES:
        foto = abrir(item)
        rgba = np.array(remove(foto, session=sessao, alpha_matting=True))
        if item.get("campanha"):
            limpar_cores(rgba)
        if "letreiro" in item:
            limpar_letreiro(rgba, np.asarray(foto), **item["letreiro"])
        gravar(limpar_alpha(rgba), item["nome"], item["larguras"])
    for item in FOTOS_INTEIRAS:
        gravar(tom_do_consultorio(abrir(item)), item["nome"], item["larguras"])


if __name__ == "__main__":
    main()
