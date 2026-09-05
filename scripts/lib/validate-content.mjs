/* ================================================================
   scripts/lib/validate-content.mjs — shape contract for
   content/site-data.mjs, enforced on every build.

   Why this exists: site-data.mjs has a split that used to be
   undocumented and unenforced. Some fields are *locale maps* —
   `{ en: "...", ru: "..." }` — and some are deliberately plain values
   that are the same in every language (tech stacks, company names,
   certification titles, product names). Nothing checked which was
   which, so a mistyped field failed silently and in two different
   directions:

     - a plain string where a locale map was expected renders the same
       text in every language, or (via `field[lang]`) `undefined`
     - a locale map where a plain string was expected renders the
       literal "[object Object]" into the page

   Neither throws. Both survive the build's drift check, because the
   build is perfectly happy to generate wrong output consistently.

   The SCHEMA below is therefore both the validator and the
   documentation: it is the answer to "is this field translated?".
   ================================================================ */

import * as data from "../../content/site-data.mjs";
import { SITE } from "../../site.config.mjs";

// The locales content/site-data.mjs is expected to carry — taken from
// site.config.mjs so there is exactly one place that decides which
// languages this site has. Every "i18n" field must have exactly these
// keys: no missing translations, no stray extras. Add a locale to the
// config and the build starts demanding translations for it.
const LOCALES = SITE.locales.map((l) => l.code);

// -------- schema --------
// Leaf types:
//   "str"     non-empty string
//   "str?"    non-empty string or null
//   "num"     finite number
//   "bool"    boolean
//   "str[]"   non-empty array of non-empty strings
//   "i18n"    locale map -> non-empty string, for every LOCALES entry
//   "i18n?"   as "i18n", or null
//   "i18n[]"  locale map -> non-empty array of non-empty strings
// Composite:
//   { ...fields }        nested object (exact key set — extras are errors)
//   { _each: <spec> }    non-empty array, every item matching <spec>

const SCHEMA = {
  PERSON: {
    name: "i18n",
    jobTitle: "i18n",
    roleTagline: "i18n",
    metaLine: "i18n",
    email: "str",
    website: "str",
    photoPath: "str",
    addressLocality: "i18n",
    addressCountry: "str",
  },

  // Single-language on purpose (see the note on PAGES in site-data.mjs).
  // notFound has no share block, so no ogTitle/ogImage/twitterCard.
  PAGES: {
    index: { title: "str", description: "str", ogTitle: "str", ogImage: "str", twitterCard: "str" },
    cv: {
      title: "str",
      description: "str",
      ogTitle: "str",
      ogImage: "str",
      twitterCard: "str",
      sitemapImage: { file: "str", title: "str" },
    },
    notFound: { title: "str", description: "str" },
  },

  LLMS_TXT: {
    summary: "str[]",
    facts: { _each: { label: "str", value: "str" } },
    note: "str",
    elsewhereHeading: "str",
  },

  NOW_PLAYING: {
    endpoint: "str",
    pollMs: "num",
  },

  ABOUT: "i18n",
  ABOUT_CV_SUFFIX: "i18n",

  SOCIALS: {
    _each: {
      key: "str",
      label: "str",
      href: "str",
      display: "str",
      contexts: "str[]",
      sameAs: "bool",
    },
  },

  // `val` is untranslated on purpose — tech/product names.
  SKILLS: {
    _each: { key: "i18n", val: "str", contexts: "str[]" },
  },

  EDUCATION: {
    university: "i18n",
    place: "i18n",
    year: "num",
    field: "i18n",
  },

  // `name` untranslated on purpose — certifications have official names.
  CERTS: {
    _each: { yr: "str", name: "str" },
  },

  LANGUAGES: {
    _each: { name: "i18n", filled: "num", sub: "i18n" },
  },

  JOBS: {
    _each: {
      dates: "i18n",
      span: "i18n",
      // org.name / org.url untranslated on purpose — companies have one
      // name and one URL. Only the human-facing location line varies.
      org: { name: "str", url: "str?", locationDisplay: "i18n" },
      title: "i18n",
      inOccupationHighlights: "bool",
      bullets: "i18n[]",
      playfulBullet: "i18n?",
      // Untranslated on purpose — a tech stack list.
      tech: "str",
    },
  },

  JSONLD: {
    knowsAbout: "i18n[]",
    // Untranslated on purpose — schema.org expects English language
    // names here regardless of page language.
    knowsLanguage: "str[]",
    demandName: "str",
  },

  LICENSE_CONTENT: {
    holder: "str",
    year: "num",
    name: "str",
    url: "str",
  },

  TRAITS: "i18n[]",
};

// -------- checking --------

function describe(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return `array(${v.length})`;
  if (typeof v === "object") return `object{${Object.keys(v).join(",")}}`;
  return `${typeof v} ${JSON.stringify(v)}`;
}

const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";

function checkLocaleMap(value, path, errors, eachIsList) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${path}: expected a locale map {${LOCALES.join(", ")}}, got ${describe(value)}`);
    return;
  }
  for (const loc of LOCALES) {
    const at = `${path}.${loc}`;
    if (!(loc in value)) {
      errors.push(`${at}: missing translation`);
      continue;
    }
    if (eachIsList) {
      if (!Array.isArray(value[loc]) || value[loc].length === 0) {
        errors.push(`${at}: expected a non-empty array of strings, got ${describe(value[loc])}`);
      } else {
        value[loc].forEach((item, i) => {
          if (!isNonEmptyString(item)) errors.push(`${at}[${i}]: expected a non-empty string, got ${describe(item)}`);
        });
      }
    } else if (!isNonEmptyString(value[loc])) {
      errors.push(`${at}: expected a non-empty string, got ${describe(value[loc])}`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!LOCALES.includes(key)) {
      errors.push(`${path}.${key}: unexpected locale (LOCALES is [${LOCALES.join(", ")}])`);
    }
  }
}

function check(value, spec, path, errors) {
  // array-of-spec
  if (spec && typeof spec === "object" && spec._each) {
    if (!Array.isArray(value)) {
      errors.push(`${path}: expected an array, got ${describe(value)}`);
      return;
    }
    if (value.length === 0) errors.push(`${path}: expected a non-empty array`);
    value.forEach((item, i) => check(item, spec._each, `${path}[${i}]`, errors));
    return;
  }

  // nested object with an exact key set
  if (spec && typeof spec === "object") {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      errors.push(`${path}: expected an object, got ${describe(value)}`);
      return;
    }
    for (const key of Object.keys(spec)) {
      if (!(key in value)) {
        errors.push(`${path}.${key}: missing`);
        continue;
      }
      check(value[key], spec[key], `${path}.${key}`, errors);
    }
    for (const key of Object.keys(value)) {
      if (!(key in spec)) {
        errors.push(`${path}.${key}: unexpected field — add it to SCHEMA in scripts/lib/validate-content.mjs if it's intentional`);
      }
    }
    return;
  }

  // leaf types
  const optional = spec.endsWith("?");
  const base = optional ? spec.slice(0, -1) : spec;
  if (optional && value === null) return;

  switch (base) {
    case "str":
      if (!isNonEmptyString(value)) errors.push(`${path}: expected a non-empty string, got ${describe(value)}`);
      break;
    case "num":
      if (typeof value !== "number" || !Number.isFinite(value)) errors.push(`${path}: expected a number, got ${describe(value)}`);
      break;
    case "bool":
      if (typeof value !== "boolean") errors.push(`${path}: expected a boolean, got ${describe(value)}`);
      break;
    case "str[]":
      if (!Array.isArray(value) || value.length === 0) {
        errors.push(`${path}: expected a non-empty array of strings, got ${describe(value)}`);
      } else {
        value.forEach((item, i) => {
          if (!isNonEmptyString(item)) errors.push(`${path}[${i}]: expected a non-empty string, got ${describe(item)}`);
        });
      }
      break;
    case "i18n":
      checkLocaleMap(value, path, errors, false);
      break;
    case "i18n[]":
      checkLocaleMap(value, path, errors, true);
      break;
    default:
      errors.push(`${path}: SCHEMA bug — unknown spec "${spec}"`);
  }
}

/**
 * Validates content/site-data.mjs against SCHEMA. Throws with every
 * problem listed at once (rather than failing on the first) so a forker
 * filling the file in for the first time gets one complete to-do list.
 */
export function validateSiteData() {
  const errors = [];

  for (const [name, spec] of Object.entries(SCHEMA)) {
    if (!(name in data)) {
      errors.push(`${name}: missing export from content/site-data.mjs`);
      continue;
    }
    check(data[name], spec, name, errors);
  }

  for (const name of Object.keys(data)) {
    if (!(name in SCHEMA)) {
      errors.push(`${name}: exported from content/site-data.mjs but not in SCHEMA — add it to scripts/lib/validate-content.mjs`);
    }
  }

  if (errors.length) {
    throw new Error(
      `content/site-data.mjs failed validation (${errors.length} problem${errors.length === 1 ? "" : "s"}):\n` +
        errors.map((e) => `  - ${e}`).join("\n") +
        localeHint(errors) +
        `\n\nThe expected shape of every field is declared in scripts/lib/validate-content.mjs.`
    );
  }
}

// Changing the locale list is the first thing most forks do, and it
// produces dozens of these at once. A generic "see the schema" is not a
// useful answer to seventy identical errors, so say what the fix is.
function localeHint(errors) {
  const unexpected = errors.filter((e) => e.includes("unexpected locale")).length;
  const missing = errors.filter((e) => /: missing$/.test(e) || e.includes("missing translation")).length;
  if (!unexpected && !missing) return "";

  const lines = ["", ""];
  if (unexpected) {
    lines.push(
      `${unexpected} of these are languages content/site-data.mjs still has but`,
      `site.config.mjs no longer lists. Delete those keys from the locale maps`,
      `above — every one is named in the list, and the file has no other`,
      `structure to get wrong. Your editor's multi-cursor will do it in one pass.`
    );
  }
  if (missing) {
    if (unexpected) lines.push("");
    lines.push(
      `${missing} of these are languages site.config.mjs lists that`,
      `content/site-data.mjs doesn't have yet. Add a key for each, alongside`,
      `the existing ones.`
    );
  }
  lines.push("", `Then run the build again — it re-checks everything and lists whatever's left.`);
  return lines.join("\n");
}
