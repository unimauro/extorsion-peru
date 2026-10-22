"""Empaqueta solo archivos públicos explícitos para GitHub Pages."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
out=root/'_site'
if out.exists(): shutil.rmtree(out)
out.mkdir()
for name in ('index.html','prototipo.html'):
    shutil.copy2(root/name,out/name)
for folder in ('assets','data','docs','research'):
    shutil.copytree(root/folder,out/folder)
(out/'.nojekyll').touch()
print('Sitio estático preparado en _site/')
