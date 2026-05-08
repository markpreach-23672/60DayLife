import type { Lesson } from "./lessons";

export function buildDailyEmail(lesson: Lesson, firstName: string): { subject: string; html: string } {
  const subject = `Day ${lesson.day}: ${lesson.title}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #faf8f5; font-family: Georgia, serif; color: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .header { background: #1e3a5f; padding: 32px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { color: #fdf6e3; font-size: 22px; margin: 0 0 4px; }
    .header p { color: #c9952a; font-size: 14px; margin: 0; letter-spacing: 1px; text-transform: uppercase; }
    .body { background: #ffffff; padding: 32px; border: 1px solid #e8dcc8; border-top: none; border-radius: 0 0 12px 12px; }
    .greeting { font-size: 16px; margin-bottom: 24px; color: #1a1a2e; }
    .phase-badge { display: inline-block; background: #1e3a5f; color: #c9952a; padding: 4px 12px; border-radius: 20px; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px; font-family: 'Arial', sans-serif; }
    .scripture-block { background: #fdf6e3; border-left: 4px solid #c9952a; padding: 20px 24px; margin: 24px 0; border-radius: 0 8px 8px 0; }
    .scripture-ref { font-family: Arial, sans-serif; font-size: 12px; color: #c9952a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .scripture-text { font-style: italic; font-size: 17px; line-height: 1.7; color: #1e3a5f; margin: 0; }
    .section-title { font-family: Arial, sans-serif; font-size: 11px; color: #c9952a; text-transform: uppercase; letter-spacing: 1.5px; margin: 28px 0 10px; font-weight: bold; }
    .lesson-text { font-size: 15px; line-height: 1.8; color: #2d2d2d; white-space: pre-line; }
    .callout { background: #f4f0ea; padding: 18px 20px; border-radius: 8px; margin: 20px 0; }
    .callout p { margin: 0; font-size: 14px; line-height: 1.7; color: #2d2d2d; }
    .prayer { background: #1e3a5f; color: #fdf6e3; padding: 24px; border-radius: 8px; margin-top: 28px; }
    .prayer .section-title { color: #c9952a; }
    .prayer p { font-style: italic; font-size: 15px; line-height: 1.8; margin: 0; }
    .cta { text-align: center; margin: 32px 0 16px; }
    .cta a { background: #1e3a5f; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; letter-spacing: 0.5px; }
    .footer { text-align: center; margin-top: 32px; font-family: Arial, sans-serif; font-size: 12px; color: #999; }
    .footer a { color: #c9952a; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <p>60-Day Christian Journey</p>
      <h1>Day ${lesson.day}: ${lesson.title}</h1>
    </div>
    <div class="body">
      <p class="greeting">Good morning, ${firstName},</p>
      <span class="phase-badge">Phase ${lesson.phase} &mdash; ${lesson.phaseName}</span>

      <div class="scripture-block">
        <div class="scripture-ref">${lesson.scriptureRef}</div>
        <p class="scripture-text">"${lesson.scriptureText}"</p>
      </div>

      <div class="section-title">Today's Lesson</div>
      <p class="lesson-text">${lesson.lessonText}</p>

      <div class="callout">
        <div class="section-title">Memory Hack</div>
        <p>${lesson.memoryHack}</p>
      </div>

      <div class="callout">
        <div class="section-title">Today's Challenge</div>
        <p>${lesson.challenge}</p>
      </div>

      <div class="prayer">
        <div class="section-title">Prayer Starter</div>
        <p>${lesson.prayerStarter}</p>
      </div>

      <div class="cta">
        <a href="https://elkhartlife.com/journey/lesson/${lesson.day}">Open in Journey App</a>
      </div>
    </div>
    <div class="footer">
      <p>Elkhart Life Church &bull; 1135 Middlebury St, Elkhart, IN 46516</p>
      <p><a href="https://elkhartlife.com">elkhartlife.com</a> &bull; <a href="pastor@elkhartlife.com">pastor@elkhartlife.com</a></p>
    </div>
  </div>
</body>
</html>
`;

  return { subject, html };
}
