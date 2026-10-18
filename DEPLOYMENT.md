# שלנו — מדריך פריסה לפרודקשן

## סקירה כללית

מדריך זה מסביר כיצד לפרוס את שלנו לסביבת פרודקשן באופן מאובטח ואמין.

## דרישות מקדימות

- Docker ו-Docker Compose מותקנים
- דומיין מוגדר עם רשומות DNS
- אישור SSL/TLS (מומלץ Let's Encrypt)
- מסד נתונים MongoDB (MongoDB Atlas, או שרת MongoDB משלך)
- אחסון קבוע לקבצים שהועלו (Volume שנשמר בין הפעלות של מכולת ה-API)

## שלב 1: הכנת סביבה

### העתק קובץ הגדרות

```bash
cp apps/api/.env.example apps/api/.env.production
```

### עדכן ערכים בקובץ .env.production

ערוך את הקובץ והכנס ערכים אמיתיים:

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://app.shlanu.app
API_URL=https://api.shlanu.app

DATABASE_URL="mongodb://USER:PASSWORD@HOST:27017/shlanu?authSource=admin"

# קבצים שהועלו נשמרים על הדיסק של מכולת ה-API — הנתיב חייב לשבת על Volume קבוע
UPLOADS_DIR=/app/uploads
MAX_FILE_SIZE_BYTES=10485760
ALLOWED_FILE_TYPES=application/pdf,image/jpeg,image/png,image/webp

SESSION_SECRET=הזן_מחרוזת_אקראית_מאובטחת_מינימום_32_תווים
COOKIE_DOMAIN=shlanu.app

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=המשתמש_שלך
SMTP_PASS=הסיסמה_שלך
SMTP_FROM=noreply@shlanu.app
EMAIL_ENABLED=true

LOG_LEVEL=warn
LOG_FORMAT=json
```

## שלב 2: אתחול מסד הנתונים

לפרויקט אין מיגרציות. הסכמות מוגדרות ב-Mongoose, והאוספים והאינדקסים נוצרים
אוטומטית כשהאפליקציה עולה מול מסד נתונים ריק — כלומר אין צעד נפרד שצריך להריץ
לפני העלייה.

אם רוצים נתוני דמו בסביבה שאינה פרודקשן:

```bash
npm run db:seed
```

בפרודקשן אמיתי דלגו על הפקודה הזו — היא יוצרת חשבונות דמו עם סיסמה ידועה מראש.

## שלב 3: בנייה והרצה עם Docker Compose

```bash
# בנה והרץ את כל השירותים
docker-compose -f docker-compose.prod.yml up -d --build

# בדוק סטטוס שירותים
docker-compose -f docker-compose.prod.yml ps

# בדוק לוגים
docker-compose -f docker-compose.prod.yml logs -f
```

## שלב 4: הגדרת פרוקסי הפוך (Nginx)

צור קובץ הגדרת Nginx לדומיין שלך:

```nginx
server {
    listen 443 ssl;
    server_name app.shlanu.app api.shlanu.app;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Proxy ל-Frontend
    location / {
        proxy_pass http://web:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Proxy ל-API
    location /api/ {
        proxy_pass http://api:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://api:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## שלב 5: גיבוי מסד נתונים

הוסף עבודה מתוזמנת לגיבוי יומי:

```bash
#!/bin/bash
# backup.sh
mongodump --uri="$DATABASE_URL" --archive="backup_$(date +%Y%m%d).gz" --gzip
aws s3 cp backup_$(date +%Y%m%d).gz s3://shlanu-backups/
```

## שלב 6: ניטור והתראות

הגדר Sentry למעקב אחר שגיאות:

```env
SENTRY_DSN=https://key@sentry.io/project
SENTRY_ENVIRONMENT=production
```

## בדיקת בריאות מערכת

בדוק שהמערכת פועלת:

```bash
# בדיקת בריאות API
curl https://api.shlanu.app/health

# תגובה מצופה:
# {"status":"healthy","timestamp":"...","services":{"database":"connected"}}
```

## בעיות נפוצות

| בעיה | פתרון |
|------|--------|
| שגיאת חיבור למסד נתונים | בדוק DATABASE_URL ודא שהמסד נגיש |
| שגיאת העלאת קבצים | בדוק הרשאות כתיבה לנתיב ב-UPLOADS_DIR |
| עוגיות לא נשלחות | ודא ש-COOKIE_DOMAIN מוגדר נכון |
| שגיאת CORS | עדכן FRONTEND_URL ב-.env |

## תמיכה

לשאלות ועזרה בפריסה, צור קשר עם צוות הפיתוח.
