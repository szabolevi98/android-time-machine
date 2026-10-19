"""Which version the mm- generators (mm-assets.py, mm-vectors.py, mm-strings.py …) build: ERA=mm (the default, 6.0.1 from
the Nexus 5X MTC20K image) or ERA=ng (7.1.2 from the Nexus 6P N2G48C image). The generators are 6.0.1's; for 7.1.2 they
read the angler image, write versions/7.1.2 and take their lists from docs/data/ng-*.tsv / ng-*.txt, so nothing of
6.0.1's lists, texts or drawables can reach 7.1.2 (docs/plan-7.1.2.md, rules 1, 4 and 5).
    ERA=ng python docs/tools/mm-strings.py"""
import os

ERAS = {
    'mm': {'device': 'bullhead', 'version': '6.0.1', 'build': 'MTC20K', 'phone': 'Nexus 5X', 'js': 'MM'},
    'ng': {'device': 'angler', 'version': '7.1.2', 'build': 'N2G48C', 'phone': 'Nexus 6P', 'js': 'NG'},
}
ERA = os.environ.get('ERA', 'mm')
if ERA not in ERAS: raise SystemExit(f'ERA={ERA}: one of {", ".join(ERAS)}')
E = ERAS[ERA]
DEVICE, VERSION, BUILD, PHONE, JS = E['device'], E['version'], E['build'], E['phone'], E['js']


def data(name):
    """docs/data/<era>-<name>: mm-strings.txt for 6.0.1, ng-strings.txt for 7.1.2."""
    return f'docs/data/{ERA}-{name}'


def out(name):
    """versions/<version>/<era>-<name>."""
    return f'versions/{VERSION}/{ERA}-{name}'
