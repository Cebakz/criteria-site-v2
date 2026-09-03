# Criteria FG — site institucional v2

Versão 2 do site da **Criteria Financial Group**: vídeo no hero, fotografia lifestyle (vela, polo, golfe, tênis, esqui), motion com GSAP e identidade do manual de marca (navy #122940, azul #1471A0, cinza #666666; TT Hoves Pro via `local()` com DM Sans de fallback).

Publicado em **https://cebakz.github.io/criteria-site-v2/**

## Páginas

- `index.html` — home
- `seguros.html` · `cambio.html` · `offshore.html` — ecossistema
- `shared.css` + `shared.js` — estilos, tokens e motion compartilhados
- `img/` (webp) e `video/` (mp4 720p) — assets; origem e licença em `ASSETS.md`

## Rodar localmente

```bash
py -3.11 -m http.server 5500
# http://localhost:5500  (o vídeo do hero precisa de um servidor com suporte a Range para tocar; o http.server do Python não tem — use qualquer servidor estático normal, ou abra o site publicado)
```

## Standalone (arquivo único)

```bash
py -3.11 build-standalone.py            # index -> criteria-v2-standalone.html
py -3.11 build-standalone.py seguros    # idem para seguros | cambio | offshore
```

Embute fontes, imagens e vídeos em base64 (~10 MB para a home). Os standalones ficam fora do git.
