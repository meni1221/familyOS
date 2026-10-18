# שלנו — מדריך פריסה לפרודקשן

## סקירה כללית

מדריך זה מסביר כיצד לפרוס את שלנו לסביבת פרודקשן באופן מאובטח ואמין.

## דרישות מקדימות

- Docker ו-Docker Compose מותקנים
- דומיין מוגדר עם רשומות DNS
- אישור SSL/TLS (מומלץ Let's Encrypt)
- מסד נתונים PostgreSQL מנוהל (AWS RDS, Google Cloud SQL, או Azure Database)
- אחסון קבצים S3-תואם (AWS S3, MinIO, או Google Cloud Storage)

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
FRONTEND_URL=https://app.familyos.app
API_URL=https://api.familyos.app

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/familyos?schema=public"
DATABASE_SSL=true

SESSION_SECRET=הזן_מחרוזת_אקראית_מאובטחת_מינימום_32_תווים
COOKIE_DOMAIN=familyos.app

STORAGE_PROVIDER=s3
STORAGE_ENDPOINT=https://s3.amazonaws.com
STORAGE_ACCESS_KEY=המפתח_שלך
STORAGE_SECRET_KEY=המפתח_הסודי_שלך
STORAGE_BUCKET=familyos-documents-prod
STORAGE_REGION=us-east-1

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=המשתמש_שלך
SMTP_PASS=הסיסמה_שלך
SMTP_FROM=noreply@familyos.app
EMAIL_ENABLED=true

LOG_LEVEL=warn
LOG_FORMAT=json
```

## שלב 2: הרצת הגירות מסד נתונים

```bash
# הגדר משתני סביבה
export DATABASE_URL="הנתיב_לבסיס_הנתונים_שלך"

# הרץ הגירות
cd apps/api
npx prisma migrate deploy

# צור אינדקסים אם נדרש
npx prisma db push
```

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
    server_name app.familyos.app api.familyos.app;

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
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
aws s3 cp backup_$(date +%Y%m%d).sql s3://familyos-backups/
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
curl https://api.familyos.app/health

# תגובה מצופה:
# {"status":"healthy","timestamp":"...","services":{"database":"connected"}}
```

## בעיות נפוצות

| בעיה | פתרון |
|------|--------|
| שגיאת חיבור למסד נתונים | בדוק DATABASE_URL ודא שהמסד נגיש |
| שגיאת העלאת קבצים | בדוק הרשאות Bucket ב-S3 |
| עוגיות לא נשלחות | ודא ש-COOKIE_DOMAIN מוגדר נכון |
| שגיאת CORS | עדכן FRONTEND_URL ב-.env |

## תמיכה

לשאלות ועזרה בפריסה, צור קשר עם צוות הפיתוח.
