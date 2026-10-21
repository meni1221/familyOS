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

# שליחת דואר (קישורי איפוס סיסמה). המערכת עולה גם בלעדיו, אבל אז לא נשלחים
# קישורי איפוס בפרודקשן — הבקשה נרשמת כשגיאה בלוג.
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=shlanu
SMTP_PASS=CHANGE_ME
SMTP_FROM="שלנו <no-reply@shlanu.app>"
```

אם `SMTP_HOST` נשאר ריק, השרת עולה ומדפיס אזהרה. בסביבת פיתוח קישור האיפוס
נרשם ללוג כדי שאפשר יהיה להשלים את הזרימה בלי תיבת דואר; בפרודקשן הוא **לא**
נרשם — לוג אינו ערוץ פרטי, ומי שקורא אותו היה יכול להשתלט על החשבון.

## שלב 2: אתחול מסד הנתונים

לפרויקט אין מיגרציות. הסכמות מוגדרות ב-Mongoose, והאוספים והאינדקסים נוצרים
אוטומטית כשהאפליקציה עולה מול מסד נתונים ריק — כלומר אין צעד נפרד שצריך להריץ
לפני העלייה.

אם רוצים נתוני דמו בסביבה שאינה פרודקשן:

```bash
npm run db:seed
```

בפרודקשן אמיתי דלגו על הפקודה הזו — היא יוצרת חשבונות דמו עם סיסמה ידועה מראש.

### חיבור ל-MongoDB Atlas

כתובת `mongodb+srv` מחייבת פתרון רשומות SRV. ה-API פותר אותן דרך ה-resolver של
Node עצמו (c-ares), ולא דרך מנגנון ה-DNS של מערכת ההפעלה — ולכן ייתכן מצב שבו
`dig` או `Resolve-DnsName` מחזירים תשובה תקינה, אבל ה-API נכשל בלוג עם
`querySrv ECONNREFUSED`. זה קורה כשהמארח מצביע על resolver מקומי שלא מאזין
(קונטיינר, VPN, או תצורת Windows מסוימת), ולא כשפרטי הגישה או Atlas שגויים.

אם זה קורה, אפשר להצביע את ה-API על שרתי DNS מפורשים. ההגדרה חלה על תהליך ה-API
בלבד, ואינה משנה את המארח:

```env
DNS_SERVERS=1.1.1.1,8.8.8.8
```

אין צורך להגדיר אותה כהחיבור עובד — כשהמשתנה חסר, Node משתמש ב-resolver של
המארח בדיוק כפי שהיה. לחלופין, אפשר להעתיק מ-Atlas את ה-URI הרגיל (בלי `+srv`),
שכולל את שלושת השרתים ואת `replicaSet` ו-`authSource` ב-query; אז אין צורך
בפתרון SRV כלל.

בכל מקרה, ב-Atlas יש לוודא תחת **Network Access** שכתובת ה-IP היוצאת של השרת
(או טווח הכתובות של ספק הענן) מורשית. אחרת החיבור נכשל ב-timeout גם כשה-DNS
תקין.

## שלב 3: בנייה והרצה עם Docker Compose

```bash
# בנה והרץ את כל השירותים
docker-compose -f docker-compose.prod.yml up -d --build

# בדוק סטטוס שירותים
docker-compose -f docker-compose.prod.yml ps

# בדוק לוגים
docker-compose -f docker-compose.prod.yml logs -f
```

### עמודים ציבוריים ו-SEO

הבנייה של הווב מריצה, אחרי Vite, את `apps/web/scripts/prerender.mjs`. הסקריפט כותב עותק של ה-HTML לכל עמוד ציבורי (`/terms`, `/privacy`, `/accessibility`) עם כותרת, תיאור, canonical ונתוני schema משלו, כך שגם בוט שאינו מריץ JavaScript מקבל את העמוד הנכון ולא את דף הבית. ה-nginx שבתוך הקונטיינר כבר מגיש את הקבצים האלה דרך `try_files $uri $uri/ /index.html`, ולכן אין צורך בשינוי נוסף. אם פרוקסי חיצוני מגיש את הקבצים בעצמו, ודאו שהנתיבים האלה מגיעים מהתיקיות ולא כ-fallback ל-`index.html`.

תמונת השיתוף `apps/web/public/og.png` (1200x630) נכללת בבנייה. אם משנים דומיין, עדכנו את `apps/web/src/seo/content.json`, ואת `apps/web/public/robots.txt` ו-`apps/web/public/sitemap.xml`.

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
# {"status":"healthy","timestamp":"...","uptimeSeconds":123,"services":{"database":"connected"}}
```

## בעיות נפוצות

| בעיה | פתרון |
|------|--------|
| שגיאת חיבור למסד נתונים | בדוק DATABASE_URL ודא שהמסד נגיש |
| `querySrv ECONNREFUSED` בלוג | ה-resolver של Node במארח אינו תקין: הגדירו `DNS_SERVERS` (למשל `1.1.1.1,8.8.8.8`) או השתמשו ב-URI רגיל ללא `+srv` |
| timeout בחיבור ל-Atlas | ודאו ב-Atlas תחת Network Access שכתובת ה-IP של השרת מורשית |
| 429 לכל המשתמשים בבת אחת | ודא שה-Proxy מעביר `X-Forwarded-For` ושהמכולה מריצה גרסה אחרונה של ה-API |
| שגיאת CORS | עדכן FRONTEND_URL ב-.env |
| 403 עם `CSRF_ORIGIN_MISMATCH` | FRONTEND_URL ו-API_URL חייבים להיות בדיוק הכתובות שהדפדפן שולח |
| משתמש מדווח על תקלה | בקש ממנו את `X-Request-Id` מתגובת השרת (מופיע בכל תשובה), וחפש אותו בלוג |
| בקשת איפוס סיסמה לא מגיעה | ודא ש-SMTP מוגדר; בלעדיו השרת רושם שגיאה ולא שולח דואר |

## תמיכה

לשאלות ועזרה בפריסה, צור קשר עם צוות הפיתוח.
