import { useSeo } from '../../hooks/useSeo';
import { publicPageSeo } from '../../lib/seo';

const PrivacyPage = () => {
  useSeo({ ...publicPageSeo('/privacy'), path: '/privacy' });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="page-title mb-6">מדיניות פרטיות</h1>

      <div className="card space-y-6">
        <section>
          <h2 className="section-title mb-2">כללי ומי אנחנו</h2>
          <p className="text-body">
            שלנו ("השירות") הוא שירות מקוון לניהול החיים המשפחתיים — משימות, לוח שנה, תקציב, שגרת תינוק ומידע משפחתי נוסף. אנחנו מכבדים את פרטיות המשתמשים ומתחייבים לשמור על המידע האישי הנמסר לנו בהתאם לדין החל במדינת ישראל, ובכלל זה חוק הגנת הפרטיות, התשמ"א-1981, ותיקון 13 לחוק.
          </p>
        </section>

        <section>
          <h2 className="section-title mb-2">איסוף מידע</h2>
          <p className="text-body mb-3">
            בעת השימוש בשירות נאסף מידע אישי הנמסר מרצון על ידי המשתמש, כגון:
          </p>
          <ul className="list-disc ps-6 space-y-1 text-body">
            <li>שם מלא</li>
            <li>כתובת דואר אלקטרוני</li>
            <li>מספר טלפון</li>
            <li>התכנים שאתם מזינים לשירות – משימות, אירועים ביומן, רשומות תקציב ורשומות שגרת תינוק</li>
            <li>פרטים נוספים הנמסרים דרך טפסי יצירת קשר</li>
          </ul>
          <p className="text-body mt-3">
            השירות אינו אוסף מידע סטטיסטי ואינו עושה שימוש בכלי מדידה, פרסום או מעקב של צדדים שלישיים.
          </p>
        </section>

        <section>
          <h2 className="section-title mb-2">עוגיות (Cookies)</h2>
          <p className="text-body">
            השירות עושה שימוש בעוגיית התחברות חיונית בלבד. העוגייה נשמרת באופן מאובטח ואינה נגישה לקוד שרץ בדפדפן (HttpOnly), ומטרתה היחידה היא לזהות אתכם לאחר הכניסה לחשבון ולשמור על החיבור. ההעדפות שתבחרו – כגון שפה והעדפות נגישות – נשמרות באחסון המקומי של הדפדפן, במכשיר שלכם בלבד. אין בשירות עוגיות פרסום או מעקב.
          </p>
        </section>

        <section>
          <h2 className="section-title mb-2">שימוש במידע</h2>
          <p className="text-body mb-3">המידע שנאסף ישמש אותנו למטרות הבאות:</p>
          <ul className="list-disc ps-6 space-y-1 text-body">
            <li>מענה לפניות וליצירת קשר עם המשתמשים.</li>
            <li>מתן השירותים – שמירת המידע שהזנתם והצגתו לכם ולבני המשפחה שהצטרפו למשפחה שלכם בשירות.</li>
            <li>שיפור ושכלול השירותים.</li>
            <li>שליחת עדכונים והודעות תפעוליות בנוגע לשירות – בכפוף להסכמת המשתמש ובאפשרות להסיר את ההסכמה (Opt-out) בכל עת.</li>
          </ul>
        </section>

        <section>
          <h2 className="section-title mb-2">מסירת מידע לצדדים שלישיים</h2>
          <p className="text-body mb-3">
            אנחנו לא נעביר מידע אישי לצדדים שלישיים, למעט באחד מהמקרים הבאים:
          </p>
          <ul className="list-disc ps-6 space-y-1 text-body">
            <li>כאשר הדבר נדרש על פי דין, צו שיפוטי או דרישה של רשות מוסמכת.</li>
            <li>לצורך הגנה משפטית או שמירה על זכויותינו.</li>
            <li>כאשר ניתן לכך אישור מפורש מהמשתמש.</li>
          </ul>
        </section>

        <section>
          <h2 className="section-title mb-2">אבטחת מידע</h2>
          <p className="text-body">
            אנחנו נוקטים באמצעי אבטחה סבירים ומקובלים לשם הגנה על המידע האישי הנמסר לנו, מפני גישה בלתי מורשית, שימוש לרעה או חשיפה. הסיסמאות נשמרות באופן מוצפן בלבד ואינן נשמרות כטקסט קריא. עם זאת, אין ביכולתנו להבטיח אבטחה מוחלטת של מידע המועבר באמצעים דיגיטליים.
          </p>
        </section>

        <section>
          <h2 className="section-title mb-2">זכויות המשתמש</h2>
          <p className="text-body">
            בהתאם לדין, כל משתמש רשאי לעיין במידע הנוגע אליו המצוי בידינו, ולבקש את תיקונו או מחיקתו. בקשה כאמור ניתן להפנות אלינו לפי פרטי הקשר שלהלן.
          </p>
        </section>

        <section>
          <h2 className="section-title mb-2">שינויים במדיניות הפרטיות</h2>
          <p className="text-body">
            אנו שומרים לעצמנו את הזכות לעדכן מעת לעת את מדיניות הפרטיות. הנוסח המעודכן יפורסם בעמוד זה ויכנס לתוקף החל ממועד פרסומו.
          </p>
        </section>

        <section>
          <h2 className="section-title mb-2">יצירת קשר</h2>
          <div className="text-body space-y-1">
            <p>טלפון: 053-3011599</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
