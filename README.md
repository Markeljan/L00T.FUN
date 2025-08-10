# l00t-fun - MiniKit Frame Application

This is a [Next.js 15](https://nextjs.org) project bootstrapped with [`create-onchain --mini`](), configured with:

- [MiniKit](https://docs.base.org/builderkits/minikit/overview)
- [OnchainKit](https://www.base.org/builders/onchainkit)
- [React 19](https://react.dev)
- [Biomejs](https://biomejs.dev)
- [TypeScript](https://www.typescriptlang.org/)
- [Bun](https://bun.sh/) as package manager

## Project Overview

**l00t-fun** is a fully functional MiniKit frame application that demonstrates:

- **Frame Management**: Add/remove frames with account association
- **Notification System**: Redis-backed notification infrastructure with webhook support
- **Wallet Integration**: Full wallet connection and management
- **Demo Components**: Interactive UI components showcasing MiniKit capabilities
- **Transaction Support**: Built-in transaction handling and status tracking

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Set up environment variables:

```bash
# Copy the example environment file
cp .env.example .env
```

Configure the following environment variables:

```bash
# Shared/OnchainKit variables
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=l00t-fun
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_ICON_URL=http://localhost:3000/icon.png
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here

# Frame metadata
FARCASTER_HEADER=your_farcaster_header
FARCASTER_PAYLOAD=your_farcaster_payload
FARCASTER_SIGNATURE=your_farcaster_signature
NEXT_PUBLIC_APP_ICON=http://localhost:3000/icon.png
NEXT_PUBLIC_APP_SUBTITLE=Your app subtitle
NEXT_PUBLIC_APP_DESCRIPTION=Your app description
NEXT_PUBLIC_APP_SPLASH_IMAGE=http://localhost:3000/splash.png
NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR=#000000
NEXT_PUBLIC_APP_PRIMARY_CATEGORY=social
NEXT_PUBLIC_APP_HERO_IMAGE=http://localhost:3000/hero.png
NEXT_PUBLIC_APP_TAGLINE=Your app tagline
NEXT_PUBLIC_APP_OG_TITLE=Your app OG title
NEXT_PUBLIC_APP_OG_DESCRIPTION=Your app OG description
NEXT_PUBLIC_APP_OG_IMAGE=http://localhost:3000/og-image.png

# Redis config (for notifications)
REDIS_URL=your_redis_url
REDIS_TOKEN=your_redis_token
```

3. Start the development server:

```bash
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server

# Code Quality
bun run typecheck    # TypeScript type checking
bun run check        # Biome linting
bun run check:fix    # Fix Biome issues automatically
```

## Implemented Features

### 🎯 Frame Management

- **Account Association**: Users can add/remove frames from their accounts
- **Frame Metadata**: Complete Frame configuration with customizable branding
- **Frame Ready State**: Proper frame initialization and readiness handling

### 🔔 Notification System

- **Redis Integration**: Persistent storage for user notification preferences
- **Webhook Handling**: Automatic processing of frame events (add/remove, notifications enable/disable)
- **Push Notifications**: Send notifications to users through the MiniApp SDK
- **API Endpoints**:
  - `/api/notify` - Send notifications to users
  - `/api/webhook` - Handle Farcaster webhook events

### 💳 Wallet Integration

- **Connect Wallet**: Seamless wallet connection with multiple providers
- **Wallet Management**: Display wallet information, balance, and account details
- **Transaction Support**: Built-in transaction components for blockchain interactions

### 🎨 UI Components

- **Demo Components**: Interactive examples showcasing MiniKit capabilities
- **Tabbed Interface**: Home and Features tabs with smooth navigation
- **Responsive Design**: Mobile-first design optimized for frame viewing
- **Theme System**: Customizable CSS variables for consistent branding

### 🛠️ Developer Experience

- **TypeScript**: Full type safety with modern TypeScript standards
- **Biome**: Fast linting and formatting with Biome.js
- **Modern Stack**: Next.js 15, React 19, Tailwind CSS 4
- **Package Management**: Bun for fast dependency management

## Project Structure

```
l00t-fun/
├── app/
│   ├── api/
│   │   ├── notify/          # Notification API endpoint
│   │   └── webhook/         # Farcaster webhook handler
│   ├── components/
│   │   └── DemoComponents.tsx # Interactive demo components
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # App layout with frame metadata
│   ├── page.tsx             # Main frame page
│   └── providers.tsx        # MiniKit and wallet providers
├── lib/
│   ├── notification.ts      # Notification service utilities
│   ├── notification-client.ts # MiniApp SDK notification client
│   └── redis.ts            # Redis connection and configuration
├── public/                  # Static assets (icons, images)
├── biome.json              # Biome configuration
├── bun.lock                # Bun lock file
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Customization

### Building Your Own Frame

1. **Update Branding**: Modify environment variables and theme colors
2. **Custom Components**: Replace demo components with your own functionality
3. **Frame Logic**: Implement your frame's core features in `page.tsx`
4. **Styling**: Customize `theme.css` and component styles

### Adding New Features

- **New API Routes**: Add endpoints in `app/api/`
- **Database Models**: Extend the Redis schema in `lib/`
- **UI Components**: Create reusable components in `app/components/`
- **External Integrations**: Add new services in `lib/`

## Deployment

1. **Build the application**:

   ```bash
   bun run build
   ```

2. **Deploy to your preferred platform** (Vercel, Netlify, etc.)

3. **Update environment variables** with production values

4. **Configure your domain** in the Farcaster Frame settings

## Learn More

- [MiniKit Documentation](https://docs.base.org/builderkits/minikit/overview)
- [OnchainKit Documentation](https://docs.base.org/builderkits/onchainkit/getting-started)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS 4 Documentation](https://tailwindcss.com/docs)
- [Biome.js Documentation](https://biomejs.dev)
- [Farcaster MiniApp SDK](https://docs.farcaster.xyz/developers/frames/miniapps)

## Contributing

This project uses modern development practices:

- **TypeScript**: Strict type checking enabled
- **Biome**: Consistent code formatting and linting
- **Bun**: Fast package management and runtime

## License

MIT License - see [LICENSE](LICENSE) file for details.
