#!/usr/bin/env python3
import requests

API_BASE = 'http://127.0.0.1:8000'
PLACEHOLDER = 'sem-capa.png'

for livro_id in range(11, 21):
    # fetch current
    r = requests.get(f"{API_BASE}/livros/{livro_id}")
    if r.status_code != 200:
        print(f"Livro {livro_id} não encontrado: {r.status_code}")
        continue
    l = r.json()
    payload = {
        'titulo': l.get('titulo'),
        'autor': l.get('autor'),
        'ano': l.get('ano'),
        'genero': l.get('genero'),
        'isbn': l.get('isbn'),
        'status': l.get('status') or 'disponivel',
        'capa': PLACEHOLDER
    }
    put = requests.put(f"{API_BASE}/livros/{livro_id}", json=payload)
    if put.status_code == 200:
        print(f"Atualizado {livro_id} -> {PLACEHOLDER}")
    else:
        print(f"Falha {livro_id}: {put.status_code} {put.text}")
