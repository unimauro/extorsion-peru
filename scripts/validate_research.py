"""Comprueba integridad de fuentes, trazas y comparación del mismo periodo."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
read=lambda p:json.loads(p.read_text())
folder=root/'research/2026-10-22'
stat=read(folder/'estadisticas_2026.json')
rows=stat['regiones']['filas']
assert len(rows)==len({r['region'] for r in rows})==26
assert sum(r['enero_julio_2025'] for r in rows)==16202
assert sum(r['enero_julio_2026'] for r in rows)==12174
for r in rows:
 assert abs(r['variacion_porcentual_calculada']-(r['enero_julio_2026']/r['enero_julio_2025']-1)*100)<0.0001
assert stat['ultimo_corte_con_conteo_verificado']=='2026-07-31'
assert stat['ultimo_catalogo_encontrado']['conteo_extorsion'] is None
for name in ['cobros_banca','comunicaciones_telco']:
 d=read(folder/f'{name}.json'); ids={s['id'] for s in d['sources']}
 assert len(ids)==len(d['sources'])
 for s in d['sources']:
  assert s['url'].startswith('https://') and s['verification'] and s['limitations']
  assert not s.get('published_at') or s['published_at']<='2026-10-22'
 for f in d['findings']: assert set(f.get('source_ids',f.get('sources',[])))<=ids
for name in ['traza_estadisticas','traza_banca','traza_telecom','plan']:
 assert read(folder/f'{name}.json')
h=read(root/'data/hipotesis.json')['items']
assert len(h)==len({x['id'] for x in h})==6
for x in h:
 assert all(x[k] for k in ['support','counterevidence','required_evidence','sources'])
 assert x['status_code'] in ['supported','partial','unknown']
trace=read(root/'data/traza_tareas.json')
for t in trace['tasks']:
 assert (root/t['output']).is_file()
 if 'trace' in t: assert (root/t['trace']).is_file()
assert read(root/'data/actualizacion_2026.json')['verified_statistical_cutoff']=='2026-07-31'
print('OK: 26 pares regionales, totales y variaciones, fuentes nuevas, 6 hipótesis y trazas enlazadas.')
