"""Verifica que el dashboard sea reproducible, cite fuentes y no mezcle proyectos con normas vigentes."""
import json, subprocess, sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
before = (root / 'data/dashboard.json').read_text(encoding='utf-8')
subprocess.run([sys.executable, str(root / 'scripts/build_dashboard.py')], check=True, capture_output=True)
assert (root / 'data/dashboard.json').read_text(encoding='utf-8') == before, 'data/dashboard.json no coincide con build_dashboard.py'
d = json.loads(before)
laws = {l['id']: l for l in d['laws']}
assert len(laws) == len(d['laws'])
for l in d['laws']:
    assert l['type'] in ('vigente', 'proyecto') and l['verification']
    assert l['url'] is None or l['url'].startswith('https://')
    if l['type'] == 'proyecto': assert 'no es ley' in l['limitations']
caps = {c['id'] for c in d['capabilities']}
for r in d['roles']:
    assert set(r['matrix']) <= caps and set(r['matrix'].values()) <= {'ok', 'conv', 'orden', 'ejecuta'}
    assert set(r['legal_basis_ids']) <= set(laws), r['id']
for s in d['route']:
    assert set(s['law_ids']) <= set(laws) and s['start_h'] < s['end_h']
    # Una meta que bloquea la intervención debe caber en la meta total y no exceder el máximo legal.
    if s['blocking']: assert s['end_h'] <= d['target_h'], s['id']
    if s['legal_max_h']: assert s['end_h'] <= s['legal_max_h'], s['id']
    assert s['deadline_type'] in ('legal', 'meta', 'propuesta')
    assert s['reform'] is None or s['reform'] in {r['id'] for r in d['reforms']}
    assert s['automation'] in ('auto', 'asistido', 'humano')
assert d['requirements'] and all(r['items'] for r in d['requirements'])
# Las decisiones con efectos sobre derechos nunca se marcan como automáticas.
assert {r['automation'] for r in d['route'] if r['id'] in ('dinero', 'captura', 'control')} <= {'asistido', 'humano'}
assert all(a['level'] in ('auto', 'asistido', 'humano') for a in d['automation'])
for t in d['tape']: assert t['law'] in laws
ids = [c['id'] for c in d['cases']]
assert len(ids) == len(set(ids))
for c in d['cases']:
    assert c['source_url'].startswith('https://') and c['tags'] and c['limitations'] and c['region_code']
    assert c['speed_kind'] in (None, 'captura', 'cota_primera_medida', 'investigacion') and (c['speed_kind'] is None) == (c['speed_days'] is None)
sources = {s['id'] for s in d['sources']}
for chain in d['tech']:
    assert chain['speed_class'] in ('minutos', 'horas', 'días', 'semanas') and chain['verdict']
    for st in chain['steps']:
        assert st['reliability'] in ('alta', 'media', 'baja') and set(st['source_ids']) <= sources
for a in d['aggregates']: assert a['source_url'].startswith('https://') and a['caveat']
assert all(r['tier'] in ('administrativo', 'reglamento', 'ley') for r in d['reforms'])
assert (root / d['bill']).exists()
for p in d['dossiers']: json.loads((root / p).read_text(encoding='utf-8'))
print(f"OK: dashboard reproducible; {len(d['cases'])} casos, {len(laws)} normas, {len(d['roles'])} roles, {len(d['tech'])} cadenas con fuentes.")
