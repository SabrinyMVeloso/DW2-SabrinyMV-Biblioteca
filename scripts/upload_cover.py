#!/usr/bin/env python3
import sys
import requests

API_BASE = 'http://127.0.0.1:8000'

if len(sys.argv) != 3:
    print('Uso: python upload_cover.py <livro_id> <caminho_para_imagem>')
    sys.exit(1)

livro_id = sys.argv[1]
image_path = sys.argv[2]

with open(image_path, 'rb') as f:
    files = {'capa': (image_path.split('\\')[-1], f, 'image/jpeg')}
    r = requests.post(f"{API_BASE}/livros/{livro_id}/capa", files=files)
    if r.status_code == 200:
        print('Upload concluido:', r.json())
    else:
        print('Falha no upload:', r.status_code, r.text)
