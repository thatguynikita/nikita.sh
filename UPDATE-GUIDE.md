# Updating content: keeping nikita.sh and /llm/ in sync

The mirror under `/llm/` exists so LLMs/crawlers see the same facts a
human sees on the live JS terminal. Every time you edit the live content,
the mirror needs the same edit — in *both* languages — or the two
sources drift apart, which is the exact "cloaking" risk flagged earlier.

## The rule of thumb

**One content change = up to 6 files touched.** Use the map below to
find them fast instead of hunting.

## Source-of-truth map

| You changed...              | Live site (source)                          | Also update in `/llm/`                                      |
|------------------------------|----------------------------------------------|----------------------------------------------------------------|
| Bio / about text             | `ABOUT_EN` / `ABOUT_RU` (index.html JS)       | `llm/index.html` §About, `llm/ru/index.html` §О себе            |
| Short skills summary         | `SKILLS_EN` / `SKILLS_RU` (index.html JS)     | `llm/index.html` §Skills table, `llm/ru/index.html` §Навыки       |
| Detailed skills (`skills.sh`)| cv.html source                                 | `llm/cv.html` §Skills, `llm/ru/cv.html` §Навыки                    |
| Contact links / socials      | `SOCIALS` (index.html JS)                      | Contact tables in **all 4** mirror pages, **plus** the `sameAs` array in the JSON-LD block of **all 4** mirror pages |
| Job history (experience.log) | cv.html source                                  | `llm/cv.html` §Experience, `llm/ru/cv.html` §Опыт работы             |
| Education                    | cv.html source                                   | `llm/cv.html` §Education, `llm/ru/cv.html` §Образование, and `alumniOf` in JSON-LD on both CV pages |
| Certifications                | cv.html source                                    | `llm/cv.html` §Certifications, `llm/ru/cv.html` §Сертификаты, and `hasCredential` in JSON-LD on both CV pages |
| Languages spoken               | cv.html source                                     | `llm/cv.html` §Languages, `llm/ru/cv.html` §Языки, and `knowsLanguage` in JSON-LD (all 4 pages) |
| Job title / tagline             | index.html header                                   | `<title>`/`<meta description>` and `jobTitle` in JSON-LD on **all 4** mirror pages, plus `llms.txt` |
| Location / availability          | index.html header line                               | `<meta description>`/header line on **all 4** pages, `address` in JSON-LD if city changes |

## Step-by-step procedure

1. **Edit the live site first.** Update the relevant JS variable(s) in
   `index.html` and/or `cv.html`. This stays your single source of truth
   for what's actually true — the mirror only ever copies it.

2. **Copy the same change into the mirror**, using the map above.
   Do the EN page, then immediately do the matching RU page in the same
   sitting — don't let one language lag behind the other.

3. **If contact links or job title changed**, also update the JSON-LD
   `<script type="application/ld+json">` block at the top of each of the
   4 mirror pages (`llm/index.html`, `llm/cv.html`, `llm/ru/index.html`,
   `llm/ru/cv.html`). These blocks duplicate `sameAs`, `jobTitle`, and a
   few other fields independently on every page, so a contact-info change
   touches all four, not just the visible text.

4. **Validate the JSON-LD** before deploying — a single missing comma
   breaks structured data silently (the page still looks fine, but
   crawlers get nothing from it). Quick check if you have Python:
   ```bash
   python3 -c "
   import json, re
   for f in ['llm/index.html','llm/cv.html','llm/ru/index.html','llm/ru/cv.html']:
       txt = open(f, encoding='utf-8').read()
       for m in re.findall(r'<script type=\"application/ld\+json\">(.*?)</script>', txt, re.S):
           json.loads(m)
       print(f, 'OK')
   "
   ```
   Or paste each `<script type="application/ld+json">` block into
   validator.schema.org to check it in a browser.

5. **Bump `<lastmod>` in `sitemap.xml`** for every URL you touched
   (today's date, `YYYY-MM-DD`). This is the signal that tells crawlers
   "this page changed, recrawl it" instead of waiting for their own
   schedule.

6. **Update `llms.txt`** if the one-line summary at the top changed
   (role, tagline, or company).

7. **Deploy.** You're serving from a Yandex Object Storage bucket behind
   nginx (SSL termination only, nginx doesn't set headers), so upload each
   changed file with `yc storage s3api put-object` and set `--content-type`
   explicitly — S3-compatible storage doesn't reliably infer charset from
   the file extension, which is what caused the `llms.txt` garbling
   earlier:
   ```bash
   yc storage s3api put-object \
     --body llm/index.html \
     --bucket <your-bucket-name> \
     --key llm/index.html \
     --content-type "text/html; charset=utf-8"

   yc storage s3api put-object \
     --body llm/ru/index.html \
     --bucket <your-bucket-name> \
     --key llm/ru/index.html \
     --content-type "text/html; charset=utf-8"

   yc storage s3api put-object \
     --body llms.txt \
     --bucket <your-bucket-name> \
     --key llms.txt \
     --content-type "text/plain; charset=utf-8"

   yc storage s3api put-object \
     --body sitemap.xml \
     --bucket <your-bucket-name> \
     --key sitemap.xml \
     --content-type "application/xml; charset=utf-8"
   ```
   Repeat with the right `--key` and content-type for any other file you
   changed (`.html` → `text/html; charset=utf-8`, `.txt` → `text/plain;
   charset=utf-8`, `.xml` → `application/xml; charset=utf-8`,
   `robots.txt` → `text/plain; charset=utf-8`). If `--content-type` isn't
   available in your installed CLI version (`yc storage s3api put-object
   --help` will confirm), set it afterward via the console: bucket →
   object → Properties → Metadata → edit `Content-Type`.

8. **Ask for a recrawl** instead of waiting. In Google Search Console,
   use URL Inspection → Request Indexing on each changed URL. Bing and
   Yandex don't have as fast a manual re-fetch option, but resubmitting
   the sitemap in their consoles nudges them too.

## Quick sanity checklist before you consider an update "done"

- [ ] Live site updated (index.html / cv.html JS)
- [ ] `llm/index.html` updated (EN)
- [ ] `llm/ru/index.html` updated (RU)
- [ ] `llm/cv.html` updated (EN), if CV content changed
- [ ] `llm/ru/cv.html` updated (RU), if CV content changed
- [ ] JSON-LD blocks updated on any page where contact/title/education/certs changed
- [ ] JSON-LD validated (no parse errors)
- [ ] `sitemap.xml` `<lastmod>` bumped for changed URLs
- [ ] `llms.txt` updated if the summary line changed
- [ ] Deployed with `--content-type` (and `charset=utf-8`) set on every uploaded file
- [ ] Reindex requested for changed URLs in GSC
