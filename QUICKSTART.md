# Quick Start Guide - Museum Docent PWA

## 5-Minute Setup

### 1. Get Your Airtable API Key

1. Log in to [Airtable](https://airtable.com)
2. Go to [Account Settings](https://airtable.com/account)
3. Click "Generate API key"
4. Copy your API key

### 2. Configure the App

Edit `.env.local`:

```env
AIRTABLE_API_KEY=paste_your_key_here
AIRTABLE_BASE_ID=app7NTxVWHDuiX8qF
AIRTABLE_TABLE_ID=tbl7qP6ZmshsKuxe6
```

### 3. Sync Data

```bash
npm run sync
```

You should see:
```
🎨 Museum Docent - Airtable Sync
================================

🔄 Fetching artworks from Airtable...
✅ Fetched 50 artworks
💾 Saving to local file...
✅ Saved 50 artworks to /public/data/artworks.json

✨ Sync complete!
📊 Total artworks: 50
```

### 4. Start the App

```bash
npm run dev
```

### 5. Open in Browser

Visit: **http://localhost:3000/docent**

---

## First Time Checklist

- [ ] Airtable API key configured
- [ ] Data synced successfully
- [ ] App opens at `/docent`
- [ ] Artworks display in grid
- [ ] Search works
- [ ] Can view artwork details
- [ ] Can switch to list view

---

## Testing Offline Mode

1. Open app in Chrome
2. Open DevTools (F12)
3. Go to Network tab
4. Change "No throttling" to "Offline"
5. Reload page
6. App should still work!

---

## Next Steps

1. **Customize branding**:
   - Edit `manifest.json` (app name, colors)
   - Replace icons in `/public`

2. **Deploy**:
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Recommended: Vercel (easiest)

3. **Set up auto-sync**:
   - Configure cron job (see DEPLOYMENT.md)
   - Data updates daily automatically

---

## Common Issues

### "Error fetching artworks"

**Solution**: Check your Airtable API key
```bash
# Verify API key is set
cat .env.local | grep AIRTABLE_API_KEY
```

### "No artworks found"

**Solution**: Run sync
```bash
npm run sync
```

### Port 3000 already in use

**Solution**: Use different port
```bash
npm run dev -- -p 3001
```

Then visit: http://localhost:3001/docent

---

## Development Tips

### Add new shadcn component
```bash
npx shadcn@latest add [component-name]
```

### Check TypeScript errors
```bash
npm run type-check
```

### View service worker status
1. Open DevTools
2. Application tab
3. Service Workers section

---

## Need Help?

1. Check [README.md](./README.md) for full documentation
2. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
3. Review Airtable field mapping in README

---

**You're ready to go! Happy docenting! 🎨**
