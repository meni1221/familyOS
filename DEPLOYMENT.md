# שלנו — מדריך פריסה לפרודקשן

## סקירה כללית

מדריך זה מסביר כיצד לפרוס את שלנו לסביבת פרודקשן באופן מאובטח ואמין.

## דרישות מקדימות

- Docker ו-Docker Compose מותקנים
- דומיין מוגדר עם רשומות DNS
- אישור SSL/TLS (מומלץ Let's Encrypt)
- מסד נתונים MongoDB (MongoDB Atlas, או שרת MongoDB משלך)

## שלב 1: הכנת סביבה

### העתק קובץ הגדרות

```bash
cp apps/api/.env.production.example apps/api/.env.production
```

### עדכן ערכים בקובץ .env.production

ערוך את הקובץ והכנס ערכים אמיתיים. כל מפתח בקובץ נקרא על ידי הקוד — שרת
שמפתח חובה חסר בו או פגום לא יעלה, ויפרט בהודעת השגיאה איזה מפתח.

```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://app.shlanu.app
API_URL=https://api.shlanu.app

DATABASE_URL="mongodb://USER:PASSWORD@HOST:27017/Shlanu?authSource=admin"
DATABASE_NAME=Shlanu

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300
AUTH_RATE_LIMIT_MAX_REQUESTS=20

LOG_LEVEL=warn
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
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy ל-API
    # ה-API סומך על צעד פרוקסי אחד בלבד — זה שאתה רואה כאן. בלעדי הכותרות
    # האלה כל הבקשות ייראו כביאות מאותה כתובת, ומגביל הקצב יחסום את כולם יחד.
    location /api/ {
        proxy_pass http://api:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://api:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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

ה-API חושף `GET /health`, שמחזיר את מצב החיבור למסד הנתונים. חברו אליו שירות
ניטור חיצוני (UptimeRobot, Better Stack, בדיקת uptime של ספק הענן) בבדיקה כל דקה,
והגדירו התראה כשהבדיקה נכשלת פעמיים ברצף.

אין עדיין אינטגרציית דיווח שגיאות בתוך האפליקציה. עד שתתווסף, שגיאות נרשמות
ללוג של המכולה (`docker-compose -f docker-compose.prod.yml logs -f api`), ורמת
הפירוט נקבעת ב-`LOG_LEVEL`.

בפרודקשן הלוג נכתב כ-JSON — שורה אחת לכל אירוע (`LOG_FORMAT=json`), כך שכל
כלי איסוף לוגים יכול לאנדקס אותו בלי מפענח ייעודי. כל תשובה כוללת כותרת
`X-Request-Id`, ואותו מזהה מופיע בכל שורת לוג של הבקשה; כשמשתמש מדווח על תקלה,
המזהה מהדפדפן מוביל ישירות לשורות הרלוונטיות.

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
| 429 לכל המשתמשים בבת אחת | ודא שה-Proxy מעביר `X-Forwarded-For` ושהמכולה מריצה גרסה אחרונה של ה-API |
| שגיאת CORS | עדכן FRONTEND_URL ב-.env |
| 403 עם `CSRF_ORIGIN_MISMATCH` | FRONTEND_URL ו-API_URL חייבים להיות בדיוק הכתובות שהדפדפן שולח |

## תמיכה

לשאלות ועזרה בפריסה, צור קשר עם צוות הפיתוח.
