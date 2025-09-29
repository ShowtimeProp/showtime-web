# Vision Helper Queries (Localization)

Paste these queries into the Vision tool in Studio (`/studio`). They help you find content missing translations.

## How to use
- Open Studio → Vision.
- Choose the dataset (usually `production`).
- Paste a query and run.
- Click a document from results to open/edit it.

---

## Services

- Missing ES title
```groq
*[_type == "service" && (!defined(titleLoc.es) || titleLoc.es == "")] {
  _id, title, slug
}
```

- Missing PT short
```groq
*[_type == "service" && (!defined(shortLoc.pt) || shortLoc.pt == "")] {
  _id, title, slug
}
```

- Missing EN body
```groq
*[_type == "service" && (!defined(bodyLoc.en) || count(bodyLoc.en) == 0)] {
  _id, title, slug
}
```

---

## Projects

- Missing ES title
```groq
*[_type == "project" && (!defined(titleLoc.es) || titleLoc.es == "")] {
  _id, title, slug
}
```

- Missing PT body
```groq
*[_type == "project" && (!defined(bodyLoc.pt) || count(bodyLoc.pt) == 0)] {
  _id, title, slug
}
```

---

## Home (Hero / CTAs)

- Missing EN CTA labels
```groq
*[_type == "home" && (
  !defined(ctaPrimaryLabelLoc.en) || ctaPrimaryLabelLoc.en == "" ||
  !defined(ctaSecondaryLabelLoc.en) || ctaSecondaryLabelLoc.en == ""
)]{_id}
```

- Missing any ES key text (kicker/title/subtitle)
```groq
*[_type == "home" && (
  !defined(heroKickerLoc.es) || heroKickerLoc.es == "" ||
  !defined(heroTitleLoc.es) || heroTitleLoc.es == "" ||
  !defined(heroSubtitleLoc.es) || heroSubtitleLoc.es == ""
)]{_id}
```

---

## Site Settings (Navigation)

- Any nav item missing any locale label
```groq
*[_type == "siteSettings"][0]{
  "missing": navigation[labelLoc.es == null || labelLoc.pt == null || labelLoc.en == null]{
    label, labelLoc, href
  }
}
```

- Missing PT site title or description
```groq
*[_type == "siteSettings"][0]{
  "missing": {
    "titlePt": select(defined(siteTitleLoc.pt) => null, true => "Missing"),
    "descPt":  select(defined(descriptionLoc.pt) => null, true => "Missing")
  }
}
```

---

## Tips
- Keep slugs shared across languages; only localize content fields.
- For blocks (`bodyLoc`), an empty array means no translation.
- Use these queries regularly after content entry for QA.

---

## Additional Quality Checks

- Titles that are too short (possible placeholders)
```groq
// Services (ES)
*[_type == "service" && length(coalesce(titleLoc.es, title)) < 4]{_id, slug, "title": coalesce(titleLoc.es, title)}

// Projects (PT)
*[_type == "project" && length(coalesce(titleLoc.pt, title)) < 4]{_id, slug, "title": coalesce(titleLoc.pt, title)}
```

- Empty or near-empty body blocks
```groq
// Services (EN) with empty body
*[_type == "service" && (!defined(bodyLoc.en) || count(bodyLoc.en) == 0)]{_id, slug, title}

// Projects (ES) very short extracted text (< 50 chars)
*[_type == "project" && defined(bodyLoc.es) && count(bodyLoc.es) > 0 && string::length(pt::text(bodyLoc.es)) < 50]{_id, slug, title}
```

- Detect HTML pasted into plain string fields
```groq
*[_type == "home" && (
  heroTitle match "*<*>*" ||
  heroTitleLoc.es match "*<*>*" ||
  heroTitleLoc.pt match "*<*>*" ||
  heroTitleLoc.en match "*<*>*"
)]{_id, heroTitle, heroTitleLoc}
```

- Navigation items with missing or empty href
```groq
*[_type == "siteSettings"][0]{navigation[!defined(href) || href == ""]{label, labelLoc, href}}
```

- Services without slug
```groq
*[_type == "service" && !defined(slug.current)]{_id, title}
```
