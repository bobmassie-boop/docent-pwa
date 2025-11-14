# Setup Checklist - Museum Docent PWA

Use this checklist to ensure everything is configured correctly.

---

## ☐ Phase 1: Initial Setup (5 minutes)

### Install Dependencies
- [ ] Navigate to `A:/docent-pwa`
- [ ] Run `npm install`
- [ ] Verify no errors in installation

### Configure Airtable
- [ ] Get Airtable API key from [airtable.com/account](https://airtable.com/account)
- [ ] Copy API key to clipboard
- [ ] Open `.env.local`
- [ ] Paste API key into `AIRTABLE_API_KEY=`
- [ ] Verify Base ID: `app7NTxVWHDuiX8qF`
- [ ] Verify Table ID: `tbl7qP6ZmshsKuxe6`

### First Sync
- [ ] Run `npm run sync`
- [ ] See "✅ Saved X artworks" message
- [ ] Check `public/data/artworks.json` exists
- [ ] Check `public/data/sync-meta.json` exists

---

## ☐ Phase 2: Local Testing (10 minutes)

### Start Development Server
- [ ] Run `npm run dev`
- [ ] Server starts on port 3000
- [ ] No build errors

### Test Artwork Browser
- [ ] Open http://localhost:3000/docent
- [ ] Artworks display in grid view
- [ ] Click "List" view - switches successfully
- [ ] Click "Grid" view - switches back
- [ ] See "Last synced: [timestamp]"
- [ ] Count matches expected artworks

### Test Search
- [ ] Type artwork title in search box
- [ ] Results filter in real-time
- [ ] Try artist name - filters correctly
- [ ] Try accession number - filters correctly
- [ ] Clear search - shows all artworks

### Test Artwork Details
- [ ] Click any artwork card
- [ ] Detail page loads
- [ ] Title displays correctly
- [ ] Artist name displays
- [ ] Thumbnail image shows
- [ ] All sections render
- [ ] "Back to Collection" button works

### Test Images
- [ ] Click "View High-Res (WiFi)" button
- [ ] High-res image loads
- [ ] Click "View Thumbnail" button
- [ ] Switches back to thumbnail

### Test Offline Mode
- [ ] Open Chrome DevTools (F12)
- [ ] Network tab > Change to "Offline"
- [ ] Reload page (Ctrl+R)
- [ ] App still loads
- [ ] Artworks still display
- [ ] Search still works
- [ ] Detail pages still work
- [ ] Thumbnails still show

---

## ☐ Phase 3: PWA Testing (Mobile)

### Test on Mobile Device
- [ ] Connect phone to same WiFi as dev machine
- [ ] Find local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- [ ] Open http://[YOUR-IP]:3000/docent on phone
- [ ] App loads correctly
- [ ] Touch scrolling works smoothly
- [ ] Search keyboard appears correctly
- [ ] Can tap to view details
- [ ] Can navigate back
- [ ] Images load

### Test PWA Install (Chrome Android)
- [ ] See "Install App" prompt
- [ ] Tap "Install"
- [ ] App icon appears on home screen
- [ ] Open from home screen
- [ ] Runs in standalone mode (no browser chrome)

### Test PWA Install (Safari iOS)
- [ ] Tap Share button
- [ ] Tap "Add to Home Screen"
- [ ] App icon appears on home screen
- [ ] Open from home screen
- [ ] Runs in standalone mode

---

## ☐ Phase 4: Pre-Deployment (Before Going Live)

### Icons
- [ ] Create 192x192px icon
- [ ] Create 512x512px icon
- [ ] Save as `public/icon-192x192.png`
- [ ] Save as `public/icon-512x512.png`
- [ ] Verify icons show in manifest

### Branding
- [ ] Update app name in `public/manifest.json`
- [ ] Update description in `public/manifest.json`
- [ ] Update theme colors if needed
- [ ] Update `src/app/layout.tsx` metadata

### Data Verification
- [ ] Review all synced artworks
- [ ] Verify images display correctly
- [ ] Check all text fields populated
- [ ] Test with real artwork sample
- [ ] Verify descriptions are complete

### Performance Check
- [ ] Run Lighthouse audit (DevTools > Lighthouse)
- [ ] Performance score 90+
- [ ] Accessibility score 90+
- [ ] Best Practices score 90+
- [ ] SEO score 90+
- [ ] PWA badge shows ✓

---

## ☐ Phase 5: Deployment

### Option A: Vercel
- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Import GitHub repo
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test deployed URL
- [ ] Verify sync works
- [ ] Test PWA install from live URL

### Option B: Self-Host
- [ ] Set up VPS
- [ ] Install Node.js 20+
- [ ] Install PM2
- [ ] Install Nginx
- [ ] Clone repository
- [ ] Configure `.env.local`
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Run `npm run sync`
- [ ] Start with PM2
- [ ] Configure Nginx
- [ ] Set up SSL (Certbot)
- [ ] Test live URL
- [ ] Verify sync works

---

## ☐ Phase 6: Post-Deployment

### Verification
- [ ] Open app on live URL
- [ ] Test PWA install
- [ ] Test offline mode
- [ ] Verify all artworks display
- [ ] Test search functionality
- [ ] Check detail pages
- [ ] Verify images load

### Monitoring
- [ ] Set up error monitoring
- [ ] Configure analytics (optional)
- [ ] Set up uptime monitoring
- [ ] Check server logs

### Auto-Sync
- [ ] Configure daily sync cron job
- [ ] Test cron runs successfully
- [ ] Verify data updates

### Backups
- [ ] Set up automated backup of `artworks.json`
- [ ] Test backup restoration
- [ ] Document backup location

---

## ☐ Phase 7: User Training

### Docent Training
- [ ] Show how to access app
- [ ] Demonstrate install to home screen
- [ ] Explain offline functionality
- [ ] Show how to search
- [ ] Demonstrate detail views
- [ ] Explain high-res vs thumbnail
- [ ] Show how to refresh data

### Admin Training
- [ ] Show how to add artworks in Airtable
- [ ] Explain sync process
- [ ] Show sync button in app
- [ ] Demonstrate CLI sync: `npm run sync`
- [ ] Show where data is stored
- [ ] Explain update process

---

## Common Issues Checklist

### Sync Fails
- [ ] Verify Airtable API key is correct
- [ ] Check Base ID matches
- [ ] Check Table ID matches
- [ ] Verify internet connection
- [ ] Check Airtable API limits

### Images Don't Load
- [ ] Verify attachments in Airtable
- [ ] Check field names: `thumbnail` and `imageUrl`
- [ ] Verify URLs are accessible
- [ ] Check browser console for errors

### Offline Mode Not Working
- [ ] Verify HTTPS (required except localhost)
- [ ] Check service worker registered (DevTools > Application)
- [ ] Clear cache and reload
- [ ] Verify `next-pwa` configured correctly

### PWA Won't Install
- [ ] Verify HTTPS enabled
- [ ] Check manifest.json is valid
- [ ] Verify icons exist
- [ ] Check service worker registered
- [ ] Clear browser cache

---

## Final Checklist

- [ ] All phases above completed
- [ ] App accessible on live URL
- [ ] PWA installs successfully
- [ ] Offline mode works
- [ ] Search functions correctly
- [ ] All images display
- [ ] Mobile experience smooth
- [ ] Auto-sync configured
- [ ] Backups in place
- [ ] Users trained
- [ ] Documentation reviewed
- [ ] Emergency contacts documented

---

**Setup Complete! ✅**

Date: _____________
Completed by: _____________
Live URL: _____________
