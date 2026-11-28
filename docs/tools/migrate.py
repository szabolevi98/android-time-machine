"""Helpers for moving code out of a version's simulator.js into modules (docs/plans/engine-migration.md): cut whole
   click cases (with their comments and block braces), single lines and spans, and reindent them for a module."""
import re
from pathlib import Path

# The checkout this file is in (a worktree's own copy edits that worktree).
ROOT = Path(__file__).resolve().parents[2].as_posix() + '/'


class Sim:
    def __init__(self, version):
        self.path = ROOT + f'versions/{version}/simulator.js'
        self.s = open(self.path, encoding='utf-8').read()

    def save(self):
        open(self.path, 'w', encoding='utf-8', newline='').write(self.s)

    def sub(self, a, b, count=1):
        n = self.s.count(a)
        assert n == count, (n, a[:140])
        self.s = self.s.replace(a, b)

    def cut_line(self, start):
        """Remove the one line whose text (after indentation) starts with `start`; return it."""
        lines = self.s.split('\n')
        hits = [i for i, l in enumerate(lines) if l.lstrip().startswith(start)]
        assert len(hits) == 1, (len(hits), start)
        line = lines.pop(hits[0])
        self.s = '\n'.join(lines)
        return line

    def cut_between(self, start, end):
        """Remove from the text `start` up to (not including) `end`; return it."""
        a = self.s.index(start)
        b = self.s.index(end, a)
        out = self.s[a:b]
        self.s = self.s[:a] + self.s[b:]
        return out

    def cut_cases(self, names=(), prefixes=(), indent=6):
        """Cut the click cases (case 'x': ...) with the given names or name prefixes, each with the comment lines just
        above it; return their text in their order."""
        lines = self.s.split('\n')
        pad = ' ' * indent
        case_re = re.compile(r"^" + pad + r"case '([^']+)':")
        starts = []
        for i, l in enumerate(lines):
            m = case_re.match(l)
            if m and (m.group(1) in names or any(m.group(1).startswith(p) for p in prefixes)):
                starts.append(i)
        assert starts, (names, prefixes)
        keep = [True] * len(lines)
        out = []
        for i in starts:
            # A case runs until the next line at its indentation that starts another case, a default or a comment.
            j = i + 1
            while j < len(lines) and not re.match(r"^" + pad + r"(case '|default:|// |\}\s*$)", lines[j]) and not re.match(r"^ {0," + str(indent - 1) + r"}\S", lines[j]):
                j += 1
            # A case written as a block ({ on its own case line, } on a line of its own) takes its closing brace.
            if lines[i].rstrip().endswith('{') and j < len(lines) and re.match(r"^" + pad + r"\}\s*$", lines[j]):
                j += 1
            k = i
            while k - 1 >= 0 and lines[k - 1].startswith(pad + '// ') and keep[k - 1]:
                k -= 1
            for x in range(k, j):
                keep[x] = False
            out.append('\n'.join(lines[k:j]))
        self.s = '\n'.join(l for l, kp in zip(lines, keep) if kp)
        return '\n'.join(out)


def indent(text, by):
    return '\n'.join((' ' * by + l if l.strip() else l) for l in text.split('\n'))


def reindent(text, old, new):
    """Lines indented by `old` spaces move to `new` (deeper lines keep their relative indentation)."""
    out = []
    for l in text.split('\n'):
        if l.startswith(' ' * old):
            out.append(' ' * new + l[old:])
        else:
            out.append(l)
    return '\n'.join(out)
