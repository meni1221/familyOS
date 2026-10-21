import { passwordResetMessage } from './messages';

const LINK = 'https://shlanu.app/reset-password?token=abc123';

describe('passwordResetMessage', () => {
  it('puts the link in the text, once, exactly as it was given', () => {
    const message = passwordResetMessage(LINK);

    expect(message.text).toContain(LINK);
    expect(message.text.split(LINK)).toHaveLength(2);
  });

  it('points at the same address in the html', () => {
    expect(passwordResetMessage(LINK).html).toContain(`href="${LINK}"`);
  });

  it('says what the link is and how long it lives', () => {
    const message = passwordResetMessage(LINK);

    expect(message.subject).toContain('סיסמה');
    expect(message.text).toContain('שעה');
    expect(message.text).toContain('לא השתנתה');
  });
});
