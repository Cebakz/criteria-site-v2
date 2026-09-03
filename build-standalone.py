"""Gera criteria-v2-standalone.html: HTML unico com fontes, imagens e videos embutidos em base64.
Uso:  py -3.11 v2/build-standalone.py
"""
import base64, mimetypes, os, re, sys, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = sys.argv[1] if len(sys.argv) > 1 else "index"
SRC = os.path.join(HERE, PAGE + ".html")
OUT = os.path.join(HERE, ("criteria-v2-standalone.html" if PAGE == "index" else f"criteria-v2-{PAGE}-standalone.html"))
mimetypes.add_type("image/webp", ".webp"); mimetypes.add_type("video/mp4", ".mp4"); mimetypes.add_type("image/svg+xml", ".svg")

def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    with open(path, "rb") as f:
        return f"data:{mime};base64,{base64.b64encode(f.read()).decode()}"

def inline_local(m):
    attr, val = m.group(1), m.group(2)
    if val.startswith(("http", "data:", "#", "../")) or ".html" in val: return m.group(0)
    p = os.path.join(HERE, val)
    if not os.path.isfile(p): print("  ! nao encontrado:", val); return m.group(0)
    return f'{attr}="{data_uri(p)}"'

def fetch(url, ua):
    req = urllib.request.Request(url, headers={"User-Agent": ua})
    return urllib.request.urlopen(req, timeout=30).read()

html = open(SRC, encoding="utf-8").read()
# 0) CSS/JS locais compartilhados -> inline
def inline_css(m):
    p = os.path.join(HERE, m.group(1))
    return "<style>\n" + open(p, encoding="utf-8").read() + "</style>" if os.path.isfile(p) else m.group(0)
def inline_js(m):
    p = os.path.join(HERE, m.group(1))
    return "<script>\n" + open(p, encoding="utf-8").read() + "</script>" if os.path.isfile(p) else m.group(0)
html = re.sub(r'<link rel="stylesheet" href="([^"h][^"]*\.css)">', inline_css, html)
html = re.sub(r'<script src="([^"h][^"]*\.js)"></script>', inline_js, html)
# 1) Google Fonts -> CSS inline com woff2 embutido
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
def inline_fonts(m):
    url = m.group(1)
    try:
        css = fetch(url, UA).decode("utf-8")
    except Exception as e:
        print("  ! fontes:", e); return m.group(0)
    def emb(mm):
        u = mm.group(1)
        try: return f"url(data:font/woff2;base64,{base64.b64encode(fetch(u, UA)).decode()})"
        except Exception: return mm.group(0)
    css = re.sub(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", emb, css)
    return f"<style>\n{css}\n</style>"
html = re.sub(r'<link href="(https://fonts\.googleapis\.com/css2[^"]+)" rel="stylesheet">', inline_fonts, html)
html = re.sub(r'<link rel="preconnect"[^>]*>\n?', "", html)
# 2) src / poster / data-src / href(icon) locais
html = re.sub(r'\b(src|poster|data-src|href)="([^"]+)"', inline_local, html)
# 3) links entre paginas -> site principal (standalone nao tem as outras paginas)
html = re.sub(r'href="(index|seguros|cambio|offshore)\.html(#[^"]*)?"', lambda m: 'href="https://criteriafg.com.br/' + ("" if m.group(1)=="index" else m.group(1)) + (m.group(2) or "") + '"', html)
open(OUT, "w", encoding="utf-8").write(html)
print(f"ok -> {OUT}  ({os.path.getsize(OUT)/1e6:.1f} MB)")
