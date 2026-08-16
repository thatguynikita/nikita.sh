// Replaces the content between a GENERATED marker pair in place, leaving
// the marker comments themselves untouched. Two comment styles are used
// in the source files: JS block comments inside <script> tags, and HTML
// comments for the one marker that sits directly in markup (cv.html's
// head JSON-LD).

function markerRegex(name, style) {
  const [open, close] =
    style === "html"
      ? [`<!-- GENERATED:${name}:START — edit content/site-data.mjs, then run scripts/build.mjs -->`, `<!-- GENERATED:${name}:END -->`]
      : [`/* GENERATED:${name}:START — edit content/site-data.mjs, then run scripts/build.mjs */`, `/* GENERATED:${name}:END */`];
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(${escape(open)}\n)([\\s\\S]*?)(\n *${escape(close)})`);
}

export function replaceMarker(fileContent, name, newBody, { style = "js" } = {}) {
  const re = markerRegex(name, style);
  if (!re.test(fileContent)) {
    throw new Error(`Marker GENERATED:${name} not found (style=${style})`);
  }
  return fileContent.replace(re, (_, open, _old, close) => `${open}${newBody}${close}`);
}
