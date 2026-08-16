// Small HTML-building helpers shared by the mirror-page templates.

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// <tr><th>key</th><td>val</td></tr> rows for a plain two-column table.
export function kvTable(rows) {
  return `<table>\n` + rows.map(([k, v]) => `    <tr><th>${escapeHtml(k)}</th><td>${v}</td></tr>`).join("\n") + `\n  </table>`;
}
