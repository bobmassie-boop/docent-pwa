# Museum Docent PWA

An offline-first Progressive Web App for museum docents to browse and explore artwork collections on mobile devices.

## Features

- ✅ **Offline-First**: Browse artworks without internet connection
- ✅ **Airtable Integration**: Sync artwork data from Airtable
- ✅ **PWA Support**: Install as native app on mobile devices
- ✅ **Search & Filter**: Find artworks by title, artist, or accession number
- ✅ **Grid/List Views**: Switch between grid and list display modes
- ✅ **Detailed Views**: Rich artwork information
- ✅ **Responsive Design**: Mobile-first, touch-friendly
- ✅ **Image Optimization**: Thumbnails offline, high-res on WiFi

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure Airtable (edit .env.local)
AIRTABLE_API_KEY=your_key_here

# 3. Sync data
npm run sync

# 4. Start development
npm run dev

# 5. Open http://localhost:3000/docent
```

## Configuration

Edit `.env.local`:

```env
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=app7NTxVWHDuiX8qF
AIRTABLE_TABLE_ID=tbl7qP6ZmshsKuxe6
```

## Usage

### Syncing Data

- **Automatic**: App checks for updates on launch (when online)
- **Manual**: Click "Refresh Data" button in app
- **CLI**: Run `npm run sync`

### Viewing Artworks

1. Open `/docent` for artwork browser
2. Toggle Grid/List view
3. Search by title, artist, or accession number
4. Click artwork for details
5. View high-res images (requires WiFi)

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

Quick deploy to Vercel:
```bash
vercel --prod
```

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Start production server
npm run sync     # Sync from Airtable
npm run lint     # Run linter
```

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- next-pwa
- Airtable API

## License

MIT
