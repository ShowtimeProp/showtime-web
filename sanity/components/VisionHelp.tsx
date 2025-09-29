import React from 'react';

export default function VisionHelp() {
  return (
    <div style={{padding: 16, lineHeight: 1.55}}>
      <h2 style={{fontWeight: 600, marginBottom: 8}}>Vision Cheatsheet</h2>
      <p>
        This is a quick reference for editors to find missing translations using the Vision tool.
        Open <strong>Vision</strong> from the top bar, select your dataset (e.g. <code>production</code>),
        and paste the queries from the cheatsheet file.
      </p>

      <p>
        Cheatsheet file: <code>sanity/VISION_QUERIES.md</code>
      </p>

      <ol>
        <li>Open Vision.</li>
        <li>Copy a query from the cheatsheet.</li>
        <li>Paste and run it in Vision.</li>
        <li>Click a result to open and complete the missing translation.</li>
      </ol>

      <p>
        Examples you will find in the cheatsheet:
      </p>
      <ul>
        <li>Services missing ES/PT/EN title, short or body.</li>
        <li>Projects missing localized title or body.</li>
        <li>Home missing CTA labels or hero texts for a locale.</li>
        <li>Navigation items missing localized labels.</li>
      </ul>

      <p>
        Tip: Keep slugs shared across languages; only localize content fields. Blocks like <code>bodyLoc</code>
        are arrays: an empty array means the translation is missing.
      </p>

      <p>
        If you need more custom queries, let the dev team know and we can extend the cheatsheet.
      </p>
    </div>
  );
}
