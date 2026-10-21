export interface MailMessage {
  subject: string;
  text: string;
  html: string;
}

/**
 * The password reset mail.
 *
 * Plain text first: it is what a client that blocks HTML shows, and what a
 * person who needs the link reads. The link is the only thing in the message
 * that has to survive intact, so the HTML around it is minimal.
 */
export const passwordResetMessage = (link: string): MailMessage => {
  return {
    subject: 'איפוס הסיסמה שלכם ב״שלנו״',
    text: [
      'קיבלנו בקשה לאיפוס הסיסמה בחשבון שלכם ב״שלנו״.',
      '',
      'לקביעת סיסמה חדשה, פתחו את הקישור:',
      link,
      '',
      'הקישור תקף לשעה אחת ומתבטל לאחר השימוש.',
      'אם לא ביקשתם לאפס סיסמה, אפשר להתעלם מהודעה זו — הסיסמה שלכם לא השתנתה.',
    ].join('\n'),
    html: `
      <div dir="rtl" lang="he" style="font-family: Heebo, Arial, sans-serif; color: #26352F; line-height: 1.7;">
        <p>קיבלנו בקשה לאיפוס הסיסמה בחשבון שלכם ב״שלנו״.</p>
        <p>
          <a href="${link}" style="display: inline-block; background: #21483C; color: #FAF7F0; padding: 10px 22px; border-radius: 8px; text-decoration: none;">
            קביעת סיסמה חדשה
          </a>
        </p>
        <p style="color: #6b7269; font-size: 13px;">
          הקישור תקף לשעה אחת ומתבטל לאחר השימוש.<br />
          אם לא ביקשתם לאפס סיסמה, אפשר להתעלם מהודעה זו — הסיסמה שלכם לא השתנתה.
        </p>
      </div>
    `.trim(),
  };
};
