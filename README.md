# WARD Website

A modern, responsive website built with Astro 5, Tailwind CSS v4, GSAP animations, and postcss-clampwind for fluid typography and spacings.

## 🚀 Tech Stack

- **Framework**: Astro 5.16.3
- **UI**: React 19.2.0 with TypeScript
- **Styling**: Tailwind CSS v4.1.17 + postcss-clampwind
- **Animations**: GSAP 3.13.0 + Lenis 1.3.15
- **Database**: Drizzle ORM with MySQL2
- **Email**: Resend
- **Components**: Radix UI, Lucide React

## 📦 Package Manager

This project uses **pnpm**. Always use pnpm commands:

```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm format           # Format code with Prettier
```

## 🛠️ Development Scripts

### Core Development

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm check            # Run Astro type checking
pnpm format           # Format code with Prettier
```

### Database Operations

```bash
pnpm generate         # Generate Drizzle migrations
pnpm push:dev         # Push schema to development database
pnpm push:prod        # Push schema to production database
pnpm migrate:dev      # Run migrations on development database
pnpm migrate:prod     # Run migrations on production database
pnpm studio:dev       # Open Drizzle Studio (development)
pnpm studio:prod      # Open Drizzle Studio (production)
```

## � Clampwind Usage

**TEXT SIZES**: Use CSS variables format - `text-[clamp(var(--text-base),var(--text-lg))]`
**SPACING**: Use unitless numbers format - `my-[clamp(40,72)]`, `px-[clamp(6,10)]`

```html
<!-- Fluid typography -->
<h1 class="text-[clamp(var(--text-base),var(--text-lg))]">Fluid Heading</h1>

<!-- Fluid spacing -->
<div class="p-[clamp(1rem,3rem)]">Fluid padding</div>

<!-- Breakpoint-specific -->
<div class="md:text-[clamp(16px,50px)]"></div>
```

## 🎬 Animations

Use GSAP with Astro client directives (`client:load`, `client:idle`, `client:visible`):

```typescript
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

gsap.to(".element", {
  scrollTrigger: {
    trigger: ".element",
    start: "top center",
    scrub: 1,
  },
  x: 100,
});
```

## 📜 Smooth Scrolling

Initialize Lenis in client-side components only:

```typescript
import Lenis from "lenis";

const lenis = new Lenis({
  duration: 1.2,
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

## 🗄️ Database

Use Drizzle ORM for type-safe operations:

```typescript
import { db } from "./db";
import { users } from "./schema";

// Insert
await db.insert(users).values({ name: "John", email: "john@example.com" });

// Query
const allUsers = await db.select().from(users);
```

## 🎯 Components

Use CVA for variants and Radix UI for accessibility:

```typescript
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
  },
);
```

## 📧 Email

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "onboarding@resend.dev",
  to: "user@example.com",
  subject: "Welcome!",
  html: "<h1>Welcome!</h1>",
});
```

## 🏗️ Project Structure

```
ward/
├── src/
│   ├── components/          # React components
│   ├── layouts/            # Astro layouts
│   ├── pages/              # Astro routes
│   ├── styles/             # Global styles
│   ├── lib/                # Utilities
│   ├── db/                 # Database schema
│   └── types/              # TypeScript types
├── drizzle.config.ts       # Drizzle config
├── postcss.config.js       # PostCSS + clampwind
├── astro.config.mjs        # Astro config
└── package.json            # Dependencies
```

## 🚀 Getting Started

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd ward
   pnpm install
   ```

2. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Required vars:

   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/database_name"
   RESEND_API_KEY="your_resend_api_key"
   RESEND_FROM_EMAIL="onboarding@yourdomain.com"
   ASTRO_PORT=4321
   NODE_ENV="development"
   ```

3. **Database setup**

   ```bash
   pnpm push:dev    # Development
   pnpm push:prod   # Production
   ```

4. **Start development**
   ```bash
   pnpm dev
   ```

## 📋 Development Guidelines

- **TypeScript** for all new code
- **Prettier** formatting (`pnpm format`)
- **CVA** for component variants
- **Radix UI** for accessibility
- **GSAP** for animations with client directives
- **Drizzle ORM** for database operations
- **Mobile-first** responsive design

## 🔧 Key Configurations

### PostCSS with Clampwind

```javascript
// postcss.config.js
import tailwindcss from "@tailwindcss/postcss";
import clampwind from "postcss-clampwind";

export default {
  plugins: [tailwindcss(), clampwind()],
};
```

### Astro Config

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";

export default defineConfig({
  integrations: [react()],
  output: "server",
  adapter: node({ mode: "standalone" }),
});
```

## 🚀 Deployment

```bash
pnpm build
pnpm preview
```

Set production environment variables and deploy to Vercel, Netlify, DigitalOcean, or Railway.

## 🐛 Troubleshooting

- **GSAP not working?** → Add `client:load` or `client:idle` directives
- **Clampwind static?** → Verify PostCSS config includes `clampwind()`
- **Tailwind classes missing?** → Ensure `@theme` directive in global CSS
- **Database connection failed?** → Test with `pnpm studio:dev`
- **Smooth scrolling broken?** → Initialize Lenis client-side only

## 📚 References

- [Astro Documentation](https://docs.astro.build/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [postcss-clampwind](https://github.com/danieledep/postcss-clampwind)
- [GSAP Animation](https://greensock.com/gsap/)
- [Lenis](https://github.com/studio-freight/lenis)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Radix UI](https://www.radix-ui.com/)

## 🎨 Design Inspiration

- [Studio Size](https://studio-size.com/)
- [Size Assets](https://size-assets.com/)
- [Infinum](https://infinum.com/)
- [Studio Site Templates](https://preview.studio.site/templates/14BqN41WrP/)
- [Dribbble Portfolio](https://dribbble.com/shots/25819330-Personal-Portfolio-Template-01)

## 🖼️ Image Conversion Script

Convert PNG/JPG images to AVIF format with resizing for optimization:

```fish
for file in (find . -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -path "*/src/*")
    set parent_dir (dirname (dirname "$file"))
    set basename (basename "$file")
    set output "$parent_dir/"(string replace -r '\.(png|jpe?g)$' '.avif' -i "$basename")
    echo "Converting $file -> $output"
    ffmpeg -y -i "$file" -vf "scale='min(1500,iw)':'min(1500,ih)':force_original_aspect_ratio=decrease" "$parent_dir/resized_temp.png"
    avifenc --min 25 --max 35 --minalpha 30 --maxalpha 40 "$parent_dir/resized_temp.png" "$output"
    rm "$parent_dir/resized_temp.png"
end
```

### Logo Conversion Script

Convert PNG logos to AVIF format without resizing:

```fish
for file in src/*.png
    set basename (basename "$file")
    set output (string replace '.png' '.avif' "$basename")
    echo "Converting $file -> $output"
    avifenc --min 35 --max 45 --minalpha 35 --maxalpha 45 "$file" "$output"
end
```
