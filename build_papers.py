#!/usr/bin/env python3
"""Regenerate the paper lists in papers.html and index.html from papers.json.

Edit papers.json, then run:  python3 build_papers.py
Only the markup between the papers:start / papers:end markers is replaced.
"""
import json, re, sys

EXT = ' target="_blank" rel="noopener"'

def esc_authors(authors, me):
    out = []
    for a in authors:
        out.append(f'<b class="me">{a}</b>' if a.startswith(me) else a)
    return ", ".join(out) + "."

def chip(l):
    return f'<a class="chip" href="{l["url"]}"{EXT}>{l["label"]}</a>'

def render_papers(data):
    me = data["me"]; years = {}
    for p in data["papers"]:
        years.setdefault(p["year"], []).append(p)
    out = []
    for y in sorted(years, reverse=True):
        out.append(f'<h2 class="year" id="y{y}">{y}</h2>\n<ul class="pubs">')
        for p in years[y]:
            caret = '<span class="caret">^</span>' if p.get("blog_only") else ''
            meta = ""
            if p.get("venue") or p.get("links"):
                v = f'<span class="venue">{p["venue"]}.</span> ' if p.get("venue") else ""
                meta = f'<div class="meta">{v}{" ".join(chip(l) for l in p.get("links", []))}</div>'
            note = f'<div class="note">{p["note"]}</div>' if p.get("note") else ""
            out.append(f'''  <li id="{p["id"]}">
    <div class="ptitle"><a href="{p["url"]}"{EXT}>{p["title"]}.</a>{caret}</div>
    <div class="authors">{esc_authors(p["authors"], me)}</div>
    {meta}{note}
  </li>''')
        out.append('</ul>')
    return "\n".join(out) + "\n"

def render_home(data):
    sel = sorted((p for p in data["papers"] if "selected" in p), key=lambda p: p["selected"]["order"])
    rows = []
    for p in sel:
        s = p["selected"]; title = s.get("title", p["title"])
        rows.append(f'<li><a class="ptitle" href="{p["url"]}"{EXT}>{title}.</a> {chip(s["link"])}</li>')
    return '<ul class="selected">\n' + "\n".join(rows) + '\n  </ul>'

def splice(path, new):
    s = open(path).read()
    a, b = s.index('<!-- papers:start -->'), s.index('<!-- papers:end -->')
    s = s[:a] + '<!-- papers:start -->\n' + new + '<!-- papers:end -->' + s[b + len('<!-- papers:end -->'):]
    open(path, "w").write(s)

if __name__ == "__main__":
    data = json.load(open("papers.json"))
    if "--check" in sys.argv:
        print(render_papers(data)); sys.exit()
    splice("papers.html", render_papers(data))
    splice("index.html", render_home(data))
    print(f'wrote {len(data["papers"])} papers to papers.html and {sum("selected" in p for p in data["papers"])} to index.html')
