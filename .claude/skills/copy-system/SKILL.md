---
name: copy-system
description: Rewrites every line of copy on a website or page so it sells and does not read like AI. Lints for AI tells, benchmarks against the category's best, applies five principles, and returns every line as before → after with a reason. Triggers on "/copy-system", "copy system", "run the copy", "fix the copy", "Texte prüfen".
---

# Copy System

Every line on the page, rewritten against the category and stripped of AI tells, with the receipts behind it.

## 1. Collect

Pull every visible line from the rendered page (headlines, sublines, buttons, captions, cards, footer), grouped by section. Render first, then read; never take copy from source only. Save as `copy.before.json` ({"Section": ["line", ...]}).

## 2. Lint (before)

Run `python3 lint.py copy.before.json`. It flags banned words and eight AI sentence shapes by regex and gives a score out of 5. No opinions in this step. Keep the output; it is the "before" receipt.

## 3. Benchmark the category

Open the homepages of the top 4 to 5 products in the same niche. Quote their hero headline and subline verbatim. Write down what the winners do that the rest do not (one line each). If a page is blocked, say so; never invent a quote.

## 4. Rewrite with five principles

1. **Don't make me think** (Krug). One reading, no mental math, no jargon the visitor has to decode.
2. **Name the pain first** (Priestley's pitch order). Problem before product.
3. **Specific or silent.** Concrete scene, number or example, or cut the line. Never invent proof, numbers, testimonials or claims the product cannot back.
4. **One ask per screen**, and the button says what it does ("Ersten Trade loggen", not "Jetzt starten").
5. **Under five minutes to read the page.** Cut before you add.

Keep the language of the page. Keep the user's own wording when it already passes; change only what fails.

## 5. Lint (after) and report

Save `copy.after.json`, run the linter again. The page is done only at 5/5. Then show the user one report (an Artifact page) with:
- where it comes from: linter, benchmark quotes, the five principles
- score before → after, measured, not asserted
- every line, grouped by section: old (struck through) → new, plus one short reason

Do not change the live page until the user has seen the report and said which lines to take.

## Notes

- A second-model "humanizer" pass (e.g. another vendor's model) is optional. If it is not connected, say so in the report; do not pretend it ran.
- Extend `WORDS` and `SHAPES` in `lint.py` when you find new tells; keep them regex-checkable.
