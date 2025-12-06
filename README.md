# WARD Website

A modern, responsive website built with Astro 5, Tailwind CSS v4, GSAP animations, and postcss-clampwind for fluid typography and spacing.

## 🚀 Tech Stack

- **Framework**: Astro 5.16.3
- **UI**: React 19.2.0 with TypeScript
- **Styling**: Tailwind CSS v4.1.17
- **Animations**: GSAP 3.13.0
- **Smooth Scrolling**: Lenis 1.3.15
- **Database**: Drizzle ORM with MySQL2
- **Email**: Resend
- **Components**: Radix UI, Lucide React
- **Fluid Typography**: postcss-clampwind

## 📦 Package Manager

This project uses **pnpm** as the package manager. Always use pnpm commands:

```bash
pnpm install          # Install dependencies
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
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

## 🎨 Styling with Tailwind CSS v4

This project uses Tailwind CSS v4 with the new CSS-based configuration system.

### Key Features

- **CSS-based configuration** via `@theme` directive
- **PostCSS integration** with clampwind plugin
- **Responsive design** with mobile-first approach
- **Component utilities** with class-variance-authority

## 🌊 Fluid Typography & Spacing with Clampwind

This project uses **postcss-clampwind** for creating fluid typography and spacing that scales seamlessly between breakpoints.

### How Clampwind Works

Instead of the standard three-value `clamp(min, preferred, max)`, you supply just a minimum and maximum:

```html
<div class="text-[clamp(16px,50px)]"></div>
```

This generates fluid CSS:

```css
.text-\[clamp\(16px\,50px\)\] {
  font-size: clamp(1rem, calc(1rem + 0.0379 * (100vw - 40rem)), 3.125rem);
}
```

### Clampwind Usage Examples

#### Basic Fluid Typography

```html
<!-- Fluid font size between 16px and 50px -->
<h1 class="text-[clamp(16px,50px)]">Fluid Heading</h1>

<!-- Fluid spacing between 1rem and 3rem -->
<div class="p-[clamp(1rem,3rem)]">Fluid padding</div>
```

#### Breakpoint-Specific Clamping

```html
<!-- Clamp only between md and lg breakpoints -->
<div class="md:max-lg:text-[clamp(16px,50px)]"></div>

<!-- Clamp from md breakpoint to largest -->
<div class="md:text-[clamp(16px,50px)]"></div>

<!-- Clamp from smallest to md breakpoint -->
<div class="max-md:text-[clamp(16px,50px)]"></div>
```

#### Custom Breakpoints

```html
<!-- Use custom breakpoints -->
<div class="min-[1000px]:max-xl:text-[clamp(16px,50px)]"></div>
```

#### Container Queries

```html
<!-- Fluid sizing based on container width -->
<div class="@md:text-[clamp(16px,50px)]"></div>
```

#### Using Tailwind Variables

```html
<!-- Clamp with Tailwind size tokens -->
<div class="text-[clamp(var(--text-sm),var(--text-lg))]"></div>

<!-- Unitless values (uses --spacing scale) -->
<div class="text-[clamp(16,50)]"></div>
```

### Clampwind Configuration

Custom breakpoints and default clamp ranges are configured in your CSS:

```css
@theme static {
  /* Custom breakpoints */
  --breakpoint-4xl: 1600px;

  /* Default clamp range when no breakpoint specified */
  --breakpoint-clamp-min: 600px;
  --breakpoint-clamp-max: 1200px;
}
```

## 🎬 Animations with GSAP

This project uses GSAP for smooth, performant animations.

### Basic Usage

```typescript
import { gsap } from "gsap";

// Simple tween
gsap.to(".element", {
  x: 100,
  duration: 1,
  ease: "power2.out",
});

// Timeline
const tl = gsap.timeline();
tl.to(".element1", { x: 100 }).to(".element2", { y: 50 }, "-=0.5");
```

### ScrollTrigger Integration

```typescript
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

gsap.to(".element", {
  scrollTrigger: {
    trigger: ".element",
    start: "top center",
    end: "bottom center",
    scrub: 1,
  },
  x: 100,
});
```

## 📜 Smooth Scrolling with Lenis

Lenis provides smooth scrolling for better user experience:

```typescript
import Lenis from "lenis";

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: "vertical",
  gestureDirection: "vertical",
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

// Connect to GSAP
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);
```

## 🗄️ Database with Drizzle ORM

### Schema Definition

```typescript
import { mysqlTable, varchar, int } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
});
```

### Database Operations

```typescript
import { db } from "./db";
import { users } from "./schema";

// Insert
await db.insert(users).values({ name: "John", email: "john@example.com" });

// Query
const allUsers = await db.select().from(users);

// Update
await db.update(users).set({ name: "Jane" }).where(eq(users.id, 1));
```

## 🎯 Component Development

### Using Class Variance Authority

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}
```

### Radix UI Components

```typescript
import * as Label from '@radix-ui/react-label';
import * as Toast from '@radix-ui/react-toast';

// Label
<Label.Root htmlFor="email">Email</Label.Root>

// Toast
<Toast.Provider>
  <Toast.Root>
    <Toast.Title>Notification</Toast.Title>
  </Toast.Root>
  <Toast.Viewport />
</Toast.Provider>
```

## 📧 Email with Resend

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: "onboarding@resend.dev",
  to: "user@example.com",
  subject: "Welcome!",
  html: "<h1>Welcome to our platform!</h1>",
});
```

## 🏗️ Project Structure

```
ward/
├── src/
│   ├── components/          # Reusable React components
│   ├── layouts/            # Astro layout components
│   ├── pages/              # Astro page routes
│   ├── styles/             # Global styles and Tailwind config
│   ├── lib/                # Utility functions and configurations
│   ├── db/                 # Database schema and connections
│   └── types/              # TypeScript type definitions
├── drizzle.config.ts       # Drizzle configuration
├── drizzle.config.dev.ts   # Development database config
├── postcss.config.js       # PostCSS configuration with clampwind
├── astro.config.mjs        # Astro configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── package.json            # Project dependencies and scripts
└── README.md              # This file
```

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ward
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   Required environment variables:

   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/database_name"

   # Email (Resend)
   RESEND_API_KEY="your_resend_api_key"
   RESEND_FROM_EMAIL="onboarding@yourdomain.com"

   # Astro
   ASTRO_PORT=4321

   # Node.js
   NODE_ENV="development"
   ```

4. **Set up database**

   ```bash
   pnpm push:dev    # For development
   pnpm push:prod   # For production
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

## 📋 Development Guidelines

### Code Style

- Use **TypeScript** for all new code
- Follow **Prettier** formatting (run `pnpm format`)
- Use **tailwind-merge** for conditional className merging
- Implement **responsive design** with mobile-first approach

### Component Guidelines

- Use **React** for interactive components
- Implement **CVA** for component variants
- Use **Radix UI** for accessible primitives
- Apply **clampwind** for fluid typography and spacing

### Animation Guidelines

- Use **GSAP** for complex animations
- Implement **Lenis** for smooth scrolling
- Ensure **performance** with `will-change` and `transform3d`
- Add **reduced motion** support for accessibility

### Database Guidelines

- Use **Drizzle ORM** for type-safe database operations
- Implement **migrations** for schema changes
- Use **environment-specific** configurations
- Follow **SQL best practices** for queries

## 🔧 Configuration Files

### PostCSS with Clampwind

```javascript
// postcss.config.js
import tailwindcss from "@tailwindcss/postcss";
import clampwind from "postcss-clampwind";

export default {
  plugins: [tailwindcss(), clampwind()],
};
```

### Astro Configuration

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";

export default defineConfig({
  integrations: [react()],
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
```

## 🚀 Deployment

### Production Build

```bash
pnpm build
pnpm preview
```

### Environment Setup for Production

1. Set production environment variables
2. Ensure database is accessible from production
3. Configure Resend API keys for production email
4. Set `NODE_ENV=production`

### Deployment Platforms

This Astro project can be deployed to:

- **Vercel**: Connect repository and set environment variables
- **Netlify**: Use `pnpm build` command and set environment variables
- **DigitalOcean**: Deploy as standalone Node.js application
- **Railway**: Auto-deploy from GitHub with environment variables

## 🔧 Client-Side Integration

### GSAP/Lenis with Astro Client Directives

For animations and smooth scrolling to work properly in Astro, use client directives:

```astro
---
// src/components/AnimatedComponent.astro
---
<div client:load>
  <div id="animated-element">Animate me</div>
</div>

<script>
  import { gsap } from 'gsap';
  import Lenis from 'lenis';

  // Initialize Lenis for smooth scrolling
  const lenis = new Lenis();
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // GSAP animation
  gsap.to('#animated-element', {
    x: 100,
    duration: 1,
    ease: 'power2.out'
  });
</script>
```

### Client Directive Options

- `client:load` - Load immediately when page loads
- `client:idle` - Load when browser is idle
- `client:visible` - Load when component enters viewport
- `client:only="react"` - React-only component, no SSR

## 🐛 Troubleshooting

### Common Issues

#### GSAP Animations Not Working

- **Problem**: Animations don't run on page load
- **Solution**: Ensure components use `client:load` or `client:idle` directives
- **Code**: Add `client:load` to the parent div containing animated elements

#### Clampwind Not Generating Fluid CSS

- **Problem**: `clamp()` values remain static
- **Solution**: Check PostCSS configuration
- **Code**: Verify `postcss.config.js` includes `clampwind()` plugin

#### Tailwind Classes Not Applying

- **Problem**: Custom Tailwind classes don't work
- **Solution**: Ensure `@theme` directive is in global CSS
- **Code**: Add `@theme` block to `src/styles/global.css`

#### Database Connection Issues

- **Problem**: `DATABASE_URL` connection fails
- **Solution**: Verify MySQL server is running and credentials are correct
- **Code**: Test connection with `pnpm studio:dev`

#### Smooth Scrolling Not Working

- **Problem**: Lenis doesn't smooth scroll
- **Solution**: Ensure Lenis is initialized on client-side only
- **Code**: Wrap Lenis initialization in `client:load` component

### Development Tips

1. **Hot Reload Issues**: Restart dev server if CSS changes don't apply
2. **Type Errors**: Run `pnpm check` to validate Astro types
3. **Database Migrations**: Always run `pnpm generate` after schema changes
4. **Performance**: Use `client:visible` for below-the-fold animations
5. **Mobile Testing**: Test clampwind values on actual devices, not just dev tools

## 📚 References

- [Astro Documentation](https://docs.astro.build/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)
- [postcss-clampwind](https://github.com/danieledep/postcss-clampwind)
- [GSAP Animation](https://greensock.com/gsap/)
- [Lenis Smooth Scrolling](https://github.com/studio-freight/lenis)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Radix UI](https://www.radix-ui.com/)

## 🎨 Design Inspiration

- [Studio Size](https://studio-size.com/)
- [Size Assets](https://size-assets.com/)
- [Infinum](https://infinum.com/)
- [Studio Site Templates](https://preview.studio.site/templates/14BqN41WrP/)
- [Dribbble Portfolio](https://dribbble.com/shots/25819330-Personal-Portfolio-Template-01)
