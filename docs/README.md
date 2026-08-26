# Scope of Work — docs/

This directory contains a LaTeX skeleton for the "Scope of Work" document (MVP prototype).

Build (local):

```bash
pdflatex scope-of-work.tex
bibtex references || true
pdflatex scope-of-work.tex
pdflatex scope-of-work.tex
```

Or with `latexmk`:

```bash
latexmk -pdf scope-of-work.tex
```

Notes:
- The document includes section placeholders in `docs/sections/`.
- Files are intentionally left as placeholders; do not fill content yet.
