# Faizan Bukhari — Portfolio Website

A production-ready, zero-build portfolio website.  
Dark industrial aesthetic · Three.js particle field · GSAP scroll animations · Fully responsive.

---

## 📁 Project Structure

```
faizan-portfolio/
├── index.html              ← Main HTML (single page)
├── css/
│   └── main.css            ← All styles
├── js/
│   ├── canvas.js           ← Three.js particle background
│   └── main.js             ← All interactions + GSAP
├── assets/
│   ├── resume.pdf          ← Your CV (add manually)
│   ├── reference_mbition.pdf
│   ├── experience_systema.pdf
│   ├── degree.pdf
│   ├── bsbi_enrollment.pdf
│   └── covers/
│       ├── sdet_cover.pdf
│       ├── tv_cover.pdf
│       ├── se_cover.pdf
│       ├── ai_cover.pdf
│       └── pm_cover.pdf
└── README.md
```

---

## 🚀 Deploy to GitHub Pages (5 minutes)

### Step 1 — Create the repo
1. Go to [github.com/new](https://github.com/new)
2. Name it: `faizan-portfolio` (or `your-username.github.io` for root hosting)
3. Set to **Public**
4. Click **Create repository**

### Step 2 — Upload files
**Option A — GitHub web UI (easiest):**
1. Drag and drop the entire `faizan-portfolio/` folder into the repo
2. Click "Commit changes"

**Option B — Git CLI:**
```bash
cd faizan-portfolio
git init
git add .
git commit -m "Initial portfolio launch"
git remote add origin https://github.com/YOUR_USERNAME/faizan-portfolio.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` · Folder: `/ (root)`
4. Click **Save**
5. Your site is live at: `https://YOUR_USERNAME.github.io/faizan-portfolio/`

---

## 📄 Add Your PDF Documents

Place these files in the `assets/` folder before uploading:

| File | Description |
|------|-------------|
| `resume.pdf` | Your combined/main CV |
| `reference_mbition.pdf` | MBition GmbH reference letter |
| `experience_systema.pdf` | SYSTEMA experience letter |
| `degree.pdf` | BSc degree certificate |
| `bsbi_enrollment.pdf` | BSBI matriculation letter |
| `covers/sdet_cover.pdf` | SDET cover letter |
| `covers/tv_cover.pdf` | T&V Engineer cover letter |
| `covers/se_cover.pdf` | Software Engineer cover letter |
| `covers/ai_cover.pdf` | AI Engineer cover letter |
| `covers/pm_cover.pdf` | Technical PO cover letter |

---

## ✏️ How to Update Content

### Adding a new certification
Open `index.html` and find `<!-- CREDENTIALS -->`.  
Copy any `<div class="cred-card">` block and update:
- `data-cat` → category: `ai`, `cloud`, `agile`, `auto`, `compliance`
- `.cred-badge` class → badge style
- `.cred-name`, `.cred-issuer`, `.cred-date` → your details

Also update the filter button count in `.cred-filters`.

### Adding a new project / experience
Find `<!-- EXPERIENCE -->` and copy a `.tl-item` block.

### Updating the availability status
Find `<!-- AVAILABILITY & CONTACT -->` and update the `.avail-item` entries.

### Changing color accent
In `css/main.css`, update:
```css
:root {
  --accent: #f5a623;   /* amber — change this */
  --accent2: #4fc3f7;  /* blue accent */
  --accent3: #a8ff78;  /* green status dots */
}
```

---

## 🌐 Custom Domain (optional)

1. Add a `CNAME` file to the repo root containing your domain:
   ```
   faizanbukhari.dev
   ```
2. Update DNS with your domain registrar — add a CNAME record pointing to `YOUR_USERNAME.github.io`

---

## 🛠 No Build Step Required

This site uses:
- **Three.js r128** — loaded from Cloudflare CDN
- **GSAP 3.12.5** — loaded from Cloudflare CDN  
- **Google Fonts** — Bebas Neue, Outfit, JetBrains Mono

No npm, no webpack, no React. Just open `index.html` in any browser to preview locally.

---

## 📱 Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+  
Mobile responsive: iOS Safari, Chrome Android

---

*Last updated: April 2026*
