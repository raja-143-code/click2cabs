# Click2Cab Website — Beginner's Guide

This is a plain HTML/CSS/JavaScript website. No build tools, no installs —
just open any `.html` file in a browser to preview it, and edit the files
in any text editor (VS Code, Notepad++, etc.) to change it.

## Folder map

```
click2cab/
├── index.html              Home page
├── about.html, contact.html, fleet.html, pricing.html   Other main pages
├── one-way-taxi.html, round-trip-taxi.html,
│   airport-transfer.html, outstation-taxi.html,
│   local-city-ride.html    Service pages
├── routes/                 One page per popular route (e.g. Dindigul → Madurai)
├── css/style.css           ALL the site's styling (colors, fonts, layout)
├── js/script.js            ALL the site's interactivity (menu, forms, links)
├── robots.txt, sitemap.xml SEO files for search engines
└── README.md                This file
```

Every page shares the same header, footer and floating call/WhatsApp
buttons — they're plain HTML repeated in each file (there's no template
system), so a change to the header layout needs to be copied into every
page. Each page is now marked with `<!-- SITE HEADER -->`, `<!-- SITE
FOOTER -->`, etc. comments to make these shared blocks easy to find.

## 1. Change your phone number / WhatsApp number (do this first)

Open **`js/script.js`** and edit the `CONFIG` block at the top:

```js
var CONFIG = {
  PHONE: "+919876543210",          // used by every "Call" button
  PHONE_DISPLAY: "+91 98765 43210", // how the number is shown as text
  WHATSAPP_NUMBER: "919876543210",  // used by every WhatsApp button
  DEFAULT_WA_MESSAGE: "Hi Click2Cab, I would like to book a taxi.",
};
```

Save the file — **every page automatically picks up the new number**,
because all the Call/WhatsApp buttons and phone-number text read from
this one place at runtime. You do not need to edit the HTML files for
this.

> Note: the phone number that appears in `<meta name="description">` tags
> (used by Google search results) is separate, static text. If you want
> to update that too, search each HTML file for `98765 43210` inside a
> `<meta ...>` tag and edit it by hand.

## 2. Change colors or fonts site-wide

Open **`css/style.css`** and edit the `:root { ... }` block near the top.
It's grouped into Brand colors, Fonts, and Shape & spacing, each with a
plain-English comment. For example, to change the main blue:

```css
--road-blue-deep:#062942;   /* darker blue: headings, footer, header bg */
```

Change the hex code and every heading, footer and header updates.

## 3. Change text or images on a page

Open the relevant `.html` file and edit the text directly — there's no
templating, so what you see in the file is what appears on the page.
Section comments (`<!-- SITE HEADER -->`, `<!-- SITE FOOTER -->`, etc.)
mark the reusable blocks so you know which parts are shared across pages.

## 4. Add a new route page

Copy an existing file in `routes/` (e.g. `dindigul-to-madurai.html`),
rename it, and update:
- the `<title>`, meta description, and canonical URL near the top
- the route name, distance, and fare details in the page body
- the JSON-LD `FAQPage` script if you change the FAQ content

Then add a link to it from `index.html`'s footer "Popular Routes" list.

## 5. Preview your changes

Just double-click any `.html` file to open it in your browser — no
server needed. To see changes live as you edit, most code editors have a
"Live Server" style extension, or you can just save and refresh the
browser tab.

## 6. Publish the site

Upload the whole folder (keeping the same structure) to any static web
host — e.g. Netlify, Vercel, GitHub Pages, or your existing web hosting
via FTP. No server-side code is required.
