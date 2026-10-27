"""Replaces the Állapot (status) line of a T package in docs/reports/simulator-limits-2026-10-23.md, the only place the
limits work keeps its status.

    python docs/tools/limits-status.py T09 "Kész — `abc12345`. What now works, how it was checked."
    python docs/tools/limits-status.py --next      the first item not done yet, in the order of the approved
                                                   rounds (second, third, fourth, fifth)"""
import re, sys

p = 'docs/reports/simulator-limits-2026-10-23.md'
s = open(p, encoding='utf-8').read()
sys.stdout.reconfigure(encoding='utf-8')

def status(tid):
    a = s.index(f'#### {tid} — ')
    i = s.index('- **Állapot:** ', a)
    return s[i + len('- **Állapot:** '):s.index('\n', i)]

if sys.argv[1] == '--next':
    # Each approved round's order: the rows of its table, | n | Tnn | ...
    for name in ('Második kör', 'Harmadik kör', 'Negyedik kör', 'Ötödik kör', 'Hatodik kör', 'Hetedik kör'):
        if name == 'Hetedik kör' and '**Státusz: jóváhagyva, végrehajtás alatt.**' in s:
            # The owner's narrower option 2 overrides the full T71–T93 order. Calendar General is package 7;
            # recurrence, new media libraries, launcher rebuilding and the other exclusions are not queued.
            packages = [('T71',), ('T75',), ('T72', 'T73', 'T74'), ('T79', 'T80'),
                        ('T77', 'T78', 'T81', 'T82', 'T83'), ('T84', 'T87'), ('T88', 'T89', 'T76')]
            for number, ids in enumerate(packages, 1):
                pending = [tid for tid in ids if not status(tid).startswith('Kész')]
                if pending:
                    print(f'Hetedik kör, 2-es változat: {number}. csomag — ' + ', '.join(pending))
                    sys.exit()
            print('a hetedik kör 2-es változatának mind a hét csomagja kész; a kizárt tételekhez új döntés kell')
            sys.exit()
        part = s[s.index('### ' + name):]
        part = part[:part.index('\n### ', 5)]
        for n, tid in re.findall(r'^\| (\d+) \| (T\d+) \|', part, re.M):
            st = status(tid)
            if not st.startswith('Kész'):
                print(f'{name}:', n, tid, '—', st[:120]); sys.exit()
    print('every item of every round is done')
    sys.exit()
tid, text = sys.argv[1], sys.argv[2]
a = s.index(f'#### {tid} — ')
i = s.index('- **Állapot:** ', a)
j = s.index('\n', i)
s = s[:i] + '- **Állapot:** ' + text + s[j:]
open(p, 'w', encoding='utf-8', newline='').write(s)
print('ok', tid)
