#!/usr/bin/env python3
"""Cache-busting: append ?v=<content-hash> to every local asset reference.

GitHub Pages serves files with `Cache-Control: max-age=600`, so without this a
browser can combine a fresh index.html with a stale cached CSS/JS file.
Run from the repo root after editing any asset:  python3 scripts/stamp-assets.py
"""
import hashlib, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent

def h(path):
    return hashlib.sha256((ROOT / path.lstrip('/')).read_bytes()).hexdigest()[:10]

def stamp(text, pattern):
    def rep(m):
        url = m.group('url')
        local = url.replace('https://mrzroot.github.io', '')
        return m.group('pre') + url + '?v=' + h(local if local.startswith('/') else '/' + local)
    return re.sub(pattern, rep, text)

# 1) font files referenced from styles.css (relative to /assets/)
css_path = ROOT / 'assets/styles.css'
css = re.sub(r'\?v=[0-9a-f]+', '', css_path.read_text())
css = re.sub(r'url\((fonts/[^)?]+)\)', lambda m: 'url(%s?v=%s)' % (m.group(1), h('/assets/' + m.group(1))), css)
css_path.write_text(css)

# 2) manifest icons
man_path = ROOT / 'site.webmanifest'
man = re.sub(r'\?v=[0-9a-f]+', '', man_path.read_text())
man = re.sub(r'"src": "(/[^"]+)"', lambda m: '"src": "%s?v=%s"' % (m.group(1), h(m.group(1))), man)
man_path.write_text(man)

# 3) HTML pages (after CSS/manifest so their hashes are final)
ASSET = r'(?P<pre>(?:href|src|content)=")(?P<url>(?:https://mrzroot\.github\.io)?/(?:assets/[^"?]+|favicon\.svg|site\.webmanifest))(?=")'
for page in ('index.html', '404.html'):
    p = ROOT / page
    txt = re.sub(r'((?:href|src|content)="[^"?]+)\?v=[0-9a-f]+"', r'\1"', p.read_text())
    p.write_text(stamp(txt, ASSET))
    print('stamped', page)
