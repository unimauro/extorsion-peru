"""Controles editoriales: esquemas, geografía, montos y archivos enlazados."""
import json
import re
import csv
from pathlib import Path
from html.parser import HTMLParser
from datetime import date
root=Path(__file__).resolve().parents[1]
load=lambda name:json.loads((root/'data'/f'{name}.json').read_text())
sources=load('fuentes'); ids={s['id'] for s in sources}
assert len(ids)==len(sources)==20
for s in sources:
    assert s['url'].startswith('https://')
    assert s['accessed_at']=='2026-10-22'
    assert s['verification'] and s['locator'] and s['scope']
    if s['published_at']: assert s['published_at']<='2026-10-22'
series=load('serie_anual')
assert [s['year'] for s in series]==list(range(2019,2026))
assert [s['complaints'] for s in series]==[3705,2689,4539,16066,22320,21915,26728]
assert [s['year'] for s in series if s['methodology_break']]==[2025]
regions=load('regiones'); codes={r['code'] for r in regions}
assert len(codes)==len(regions)==26
assert '15' not in codes and {'15M','15R','07'}<=codes
geo=json.loads((root/'data/departamentos.geojson').read_text())
gc={f['properties']['coddep'] for f in geo['features']}
assert len(gc)==25 and gc==((codes-{'15M','15R'})|{'15'})
assert all(r['rate_per_100k']>0 and r['year']==2025 for r in regions)
cases=load('casos')
assert len({c['id'] for c in cases})==len(cases)==5
assert len({c['source_url'] for c in cases})==len(cases)
required={'event_date','event_date_precision','published_at','geographic_precision','communication_channels','payment_methods','entities_mentioned','demanded_pen','paid_pen','recovered_pen','frozen_pen','seized_pen','currency','procedural_stage','source_ids','evidence_locator','accessed_at','limitations'}
for c in cases:
    assert required<=c.keys() and set(c['source_ids'])<=ids
    assert c['currency']=='PEN' and c['evidence_locator'] and c['limitations']
    if c['event_date']: assert date.fromisoformat(c['event_date'])<=date.fromisoformat(c['published_at'])
    for k in ['demanded_pen','paid_pen','recovered_pen','frozen_pen','seized_pen','controlled_payment_pen']: assert c[k] is None or c[k]>=0
    assert c['sim_type'] is None and c['esim_provider'] is None
    assert not re.search(r'\b9\d{8}\b',json.dumps(c,ensure_ascii=False)), 'Posible teléfono personal'
assert next(c for c in cases if c['id']=='C003')['paid_pen'] is None
assert next(c for c in cases if c['id']=='C003')['controlled_payment_pen']==5
assert next(c for c in cases if c['id']=='C004')['paid_pen']==900
assert next(c for c in cases if c['id']=='C005')['paid_pen'] is None
assert sum(t['inconsistent_lines'] for t in load('telecom'))==217045
for name in ['serie_anual','regiones','serie_fiscal_semestral','telecom','responsabilidades']:
    rows=load(name)
    assert all(r['source_id'] in ids for r in rows)
    with (root/'data'/f'{name}.csv').open(encoding='utf-8-sig') as f: assert len(list(csv.DictReader(f)))==len(rows)
class Links(HTMLParser):
    def handle_starttag(self,tag,attrs):
        for k,v in attrs:
            if k in ('href','src') and v and not v.startswith(('https:','http:','#','data:')):
                assert (root/v.split('#')[0].split('?')[0]).is_file(),f'Archivo no encontrado: {v}'
Links().feed((root/'index.html').read_text())
print('OK: fuentes, fechas, 5 casos, montos, 26 regiones/25 geometrías, series separadas, suma telecom, CSV y enlaces locales.')
