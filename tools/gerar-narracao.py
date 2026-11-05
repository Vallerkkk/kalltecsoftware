"""Gera as narracoes da apresentacao em MP3 usando vozes neurais gratuitas (Edge TTS).

Uso: python tools/gerar-narracao.py [--voice pt-BR-ThalitaMultilingualNeural] [--rate +8%]

Os textos ficam em narrations.js, que e a unica fonte das falas da Vera.
"""

import argparse
import asyncio
import pathlib
import re
import sys

import edge_tts

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "narrations.js"
OUTPUT_DIR = ROOT / "public" / "audio"

# A pronuncia escrita nao coincide com a fala brasileira; o texto exibido na tela permanece intacto.
PRONUNCIATION = {
    "KallTec": "Caltec",
    "SOAP": "Sóap",
    "Wi-Fi": "uáifai",
    "PBKDF2": "Pebecadéfe dois",
    "SBIS": "Ésbiiés",
    "CFM": "Céefeéme",
    "SQLite": "Sculait",
}


def read_narrations():
    source = SOURCE.read_text(encoding="utf-8")
    body = source.split("[", 1)[1].rsplit("]", 1)[0]
    texts = re.findall(r'"((?:[^"\\]|\\.)*)"', body)
    return [t.replace('\\"', '"').replace("\\n", "\n") for t in texts]


def for_speech(text):
    for written, spoken in PRONUNCIATION.items():
        text = re.sub(rf"\b{written}\b", spoken, text)
    return text


async def generate(index, text, voice, rate):
    destination = OUTPUT_DIR / f"slide-{index + 1:02d}.mp3"
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(str(destination))
    return destination, destination.stat().st_size


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", default="pt-BR-ThalitaMultilingualNeural")
    parser.add_argument("--rate", default="+8%")
    parser.add_argument("--slide", type=int, help="gera apenas um slide (1 = primeiro)")
    args = parser.parse_args()

    texts = read_narrations()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"{len(texts)} narracoes | voz {args.voice} | velocidade {args.rate}")

    for index, text in enumerate(texts):
        if args.slide is not None and index + 1 != args.slide:
            continue
        path, size = await generate(index, for_speech(text), args.voice, args.rate)
        print(f"slide {index + 1:2d} -> {path.name} ({size / 1024:.0f} KB)")

    print("Concluido.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(130)
