
## Papers

The paper lists on `papers.html` and `index.html` are generated from `papers.json`.
To add or edit a paper, change the JSON and run `python3 build_papers.py`, which
rewrites only the marked blocks in those two files. Papers with a `selected`
entry also appear on the home page, in `order`.
