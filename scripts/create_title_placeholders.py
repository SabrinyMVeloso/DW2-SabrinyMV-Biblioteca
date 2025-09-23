#!/usr/bin/env python3
import requests
import unicodedata
import re
import os

API_BASE = 'http://127.0.0.1:8000'
CAPAS_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'capas')
PLACEHOLDER = 'sem-capa.png'


def normalize_title(s):
    s = s.lower()
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r'[^a-z0-9]+', '_', s)
    s = s.strip('_')
    return s


def main():
    os.makedirs(CAPAS_DIR, exist_ok=True)
    r = requests.get(f"{API_BASE}/livros")
    r.raise_for_status()
    data = r.json()
    if isinstance(data, dict) and 'value' in data:
        livros = data['value']
    else:
        livros = data
    created = []
    for l in livros:
        if l.get('id') >= 11 and (not l.get('capa') or l.get('capa') == 'sem-capa.png'):
            title = l.get('titulo') or f'livro_{l.get("id")} '
            name = normalize_title(title)
            dest = os.path.join(CAPAS_DIR, f"{name}.jpg")
            src = os.path.join(CAPAS_DIR, PLACEHOLDER)
            try:
                with open(src, 'rb') as s, open(dest, 'wb') as d:
                    d.write(s.read())
                created.append(dest)
            except Exception as e:
                print('Erro ao criar placeholder para', l.get('id'), e)
    print('Criados:', len(created))
    for c in created:
        print(' -', c)

if __name__ == '__main__':
    main()
