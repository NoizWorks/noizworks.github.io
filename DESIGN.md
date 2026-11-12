# NoizWorks website design

The root page presents NoizWorks as an independent multi-project organization. MediaLatch has its own page at `/medialatch/`, with its recognizable icon, concrete workflow and an explicit distinction between release 3.0.7 and development features. Do not invent additional projects or availability dates.

Use the generated NW mark for organization identity and the existing MediaLatch mark only for the product. Use the shared `site.css`: a dark background, restrained warm accents, approved Google Fonts with system fallbacks, readable line lengths and visible keyboard focus. No framework or build step is required.

Use semantic landmarks, one h1 per page, a skip link and descriptive links. Layout must reflow at 320px without hiding content. Keep local artwork dimensions explicit to reserve its space. Decorative SVGs have empty alt text.

The shared `/privacy.html` keeps a stable address. It separates website/contact handling from MediaLatch-specific data flows and future product notices. The product page and OAuth privacy URL must point to that same policy. Preserve the exact owner-provided Google verification tag and HTML verification file.

Do not add analytics, tracking pixels, account forms or scripts as visual decoration. The approved Google Fonts stylesheet is the only external font dependency. Website publication does not change the extension, its license or a provider's verification decision.
