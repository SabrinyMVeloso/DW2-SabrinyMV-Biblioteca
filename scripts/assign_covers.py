#!/usr/bin/env python3
import os
import unicodedata
import re
import requests

API_BASE = 'http://127.0.0.1:8000'
CAPAS_DIR = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'capas')


def normalize(s):
    if s is None:
        return ''
    s = s.lower()
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r'[^a-z0-9]+', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def main():
    print('Carregando capas em:', CAPAS_DIR)
    files = [f for f in os.listdir(CAPAS_DIR) if os.path.isfile(os.path.join(CAPAS_DIR, f))]
    file_bases = {normalize(os.path.splitext(f)[0]): f for f in files}
    print('Capas disponíveis:', len(files))

    r = requests.get(f'{API_BASE}/livros')
    r.raise_for_status()
    data = r.json()
    # Handle if the response is wrapped by Invoke-RestMethod style
    if isinstance(data, dict) and 'value' in data:
        livros = data['value']
    else:
        livros = data

    updated = []
    skipped = []

    for l in livros:
        if l.get('capa'):
            continue
        title = l.get('titulo') or ''
        norm_title = normalize(title)
        matched_file = None
        # Try exact match
        if norm_title in file_bases:
            matched_file = file_bases[norm_title]
        else:
            # Try partial match: any file base that contains all important words
            words = [w for w in norm_title.split() if len(w) > 2]
            for base, fname in file_bases.items():
                if all(w in base for w in words):
                    matched_file = fname
                    break
            # Try contains first two words
            if not matched_file and len(words) >= 1:
                for base, fname in file_bases.items():
                    if words[0] in base:
                        matched_file = fname
                        break

        if matched_file:
            payload = {
                'titulo': l.get('titulo'),
                'autor': l.get('autor'),
                'ano': l.get('ano'),
                'genero': l.get('genero'),
                'isbn': l.get('isbn'),
                'status': l.get('status') or 'disponivel',
                'capa': matched_file
            }
            put = requests.put(f"{API_BASE}/livros/{l.get('id')}", json=payload)
            if put.status_code == 200:
                print(f"Atualizado livro id={l.get('id')} -> capa={matched_file}")
                updated.append((l.get('id'), matched_file))
            else:
                print(f"Falha ao atualizar id={l.get('id')}: {put.status_code} {put.text}")
                skipped.append((l.get('id'), 'put-failed'))
        else:
            skipped.append((l.get('id'), 'no-match'))

    print('\nRelatório:')
    print('Atualizados:', len(updated))
    for u in updated:
        print(' -', u)
    print('Não encontrados/skipados:', len(skipped))
    for s in skipped:
        print(' -', s)

if __name__ == '__main__':
    main()
