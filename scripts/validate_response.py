"""Verifica procedencia y separación entre propuesta y facultades vigentes."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
d=json.loads((root/'data/respuesta_rapida.json').read_text())
ids={s['id'] for s in d['sources']}
assert len(ids)==len(d['sources'])
for s in d['sources']:
 assert s['url'].startswith('https://') and s['verification'] and s['locator']
for group in ['legal','limits']:
 for r in d[group]: assert set(r['sources'])<=ids
for row in d['roadmap']: assert row['gate'] and row['deliverable']
for path in d['trace']['dossiers']: assert json.loads((root/path).read_text())
assert len(d['modules'])==6 and len(d['roadmap'])==3
assert d['status']=='Propuesta ciudadana; no sistema estatal operativo'
print('OK: propuesta, fuentes legales/técnicas, condiciones de implementación y dosieres.')
