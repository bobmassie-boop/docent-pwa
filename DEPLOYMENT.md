# Museum Docent PWA - Deployment Guide

## Pre-Deployment Checklist

- [ ] Airtable API key obtained
- [ ] Artwork data synced successfully
- [ ] App tested locally
- [ ] Icons created (192x192, 512x512)
- [ ] Environment variables configured
- [ ] Git repository initialized

---

## Option 1: Deploy to Vercel (Recommended)

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)

### Steps

1. **Push to Git:**
   ```bash
   cd A:/docent-pwa
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/docent-pwa.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your repository
   - Configure project:
     - Framework: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables:**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
   AIRTABLE_BASE_ID=app7NTxVWHDuiX8qF
   AIRTABLE_TABLE_ID=tbl7qP6ZmshsKuxe6
   NEXT_PUBLIC_APP_NAME=Museum Docent
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployment URL

5. **Initial Data Sync:**
   ```bash
   # After first deploy, sync data:
   curl -X POST https://your-app.vercel.app/api/sync
   ```

6. **Custom Domain (Optional):**
   - Go to Settings → Domains
   - Add your domain
   - Update DNS records as shown

### Vercel Configuration

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

---

## Option 2: Self-Host on VPS

### Prerequisites
- VPS with Ubuntu 22.04+
- Domain name pointing to VPS IP
- SSH access to server

### Steps

1. **Server Setup:**
   ```bash
   # SSH into server
   ssh user@your-server-ip

   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 20
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install -y nginx

   # Install Certbot (for SSL)
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Deploy Application:**
   ```bash
   # Clone repository
   cd /var/www
   sudo git clone https://github.com/yourusername/docent-pwa.git
   cd docent-pwa

   # Install dependencies
   sudo npm install --production

   # Create .env.local
   sudo nano .env.local
   # Paste your environment variables

   # Build application
   sudo npm run build

   # Sync initial data
   sudo npm run sync
   ```

3. **Configure PM2:**
   ```bash
   # Create ecosystem file
   sudo nano ecosystem.config.js
   ```

   Paste:
   ```javascript
   module.exports = {
     apps: [{
       name: 'docent-pwa',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

   Start app:
   ```bash
   sudo pm2 start ecosystem.config.js
   sudo pm2 save
   sudo pm2 startup
   ```

4. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/docent-pwa
   ```

   Paste:
   ```nginx
   server {
       listen 80;
       server_name docent.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/docent-pwa /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Set Up SSL:**
   ```bash
   sudo certbot --nginx -d docent.yourdomain.com
   ```

   Follow prompts to complete SSL setup.

6. **Verify Deployment:**
   ```bash
   pm2 status
   sudo systemctl status nginx
   curl https://docent.yourdomain.com
   ```

---

## Option 3: Deploy to Netlify

1. **Push to Git** (same as Vercel)

2. **Import to Netlify:**
   - Visit [app.netlify.com/start](https://app.netlify.com/start)
   - Connect Git repository
   - Configure build:
     - Build command: `npm run build`
     - Publish directory: `.next`

3. **Add Environment Variables:**
   In Netlify dashboard → Site settings → Environment variables

4. **Deploy:**
   - Click "Deploy site"
   - Visit deployment URL

---

## Post-Deployment Tasks

### 1. Test PWA Functionality

- Open app on mobile device
- Test "Add to Home Screen"
- Enable airplane mode
- Verify offline functionality
- Test search/filter
- Check image loading

### 2. Set Up Monitoring

**Vercel Analytics:**
```bash
npm install @vercel/analytics
```

Add to `layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**Self-Hosted Monitoring:**
```bash
# Install PM2 monitoring
pm2 install pm2-server-monit

# View logs
pm2 logs docent-pwa

# Monitor resources
pm2 monit
```

### 3. Schedule Data Syncs

**Vercel (use Vercel Cron Jobs):**

Create `/api/cron/sync/route.ts`:
```typescript
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Trigger sync
  await fetch(`${process.env.NEXT_PUBLIC_URL}/api/sync`, {
    method: 'POST'
  });

  return Response.json({ success: true });
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/sync",
    "schedule": "0 2 * * *"
  }]
}
```

**Self-Hosted (use cron):**
```bash
# Edit crontab
crontab -e

# Add daily sync at 2 AM
0 2 * * * cd /var/www/docent-pwa && npm run sync
```

### 4. Configure Backups

```bash
# Backup artwork data daily
0 3 * * * cp /var/www/docent-pwa/public/data/artworks.json /backup/artworks-$(date +\%Y\%m\%d).json
```

---

## Updating the App

### Vercel
```bash
# Push changes
git add .
git commit -m "Update message"
git push origin main

# Vercel auto-deploys
```

### Self-Hosted
```bash
# SSH into server
ssh user@your-server-ip

# Pull changes
cd /var/www/docent-pwa
sudo git pull origin main

# Rebuild
sudo npm install
sudo npm run build

# Restart app
sudo pm2 restart docent-pwa
```

---

## Troubleshooting

### Build Fails

**Check logs:**
```bash
# Vercel: View in dashboard
# Self-hosted:
pm2 logs docent-pwa --lines 100
```

**Common issues:**
- Missing environment variables
- Node version mismatch
- Build errors in code

### App Won't Install as PWA

**Requirements:**
- HTTPS required (except localhost)
- Valid `manifest.json`
- Service worker registered
- Icons present

**Check manifest:**
```bash
curl https://your-domain.com/manifest.json
```

Should return valid JSON.

### Data Not Syncing

**Test sync endpoint:**
```bash
curl -X POST https://your-domain.com/api/sync
```

Should return:
```json
{
  "success": true,
  "count": 123,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

**Check environment variables:**
```bash
# Self-hosted:
cat /var/www/docent-pwa/.env.local

# Vercel:
# Check in dashboard → Settings → Environment Variables
```

### Slow Performance

**Enable caching:**

In `next.config.mjs`:
```javascript
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
};
```

**Optimize images:**
```bash
# Install sharp for image optimization
npm install sharp
```

**Monitor:**
```bash
# Check memory usage
pm2 monit

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
```

---

## Security Checklist

- [ ] Environment variables not exposed to client
- [ ] API routes protected
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (if needed)
- [ ] Regular dependency updates
- [ ] Backup strategy in place

---

## Support

For deployment issues:

1. Check logs (Vercel dashboard or `pm2 logs`)
2. Verify environment variables
3. Test sync endpoint
4. Check DNS configuration
5. Review firewall settings

---

## Performance Targets

- **Lighthouse Score**: 90+ across all categories
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s on 3G
- **Offline Load**: < 500ms

---

**Deployment complete! Your PWA is now live and accessible offline.**
