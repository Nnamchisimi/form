import { LOGO_URL } from './constants';

export const baseEmailTemplate = (title, bodyContent) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background-color: #000000; padding: 24px 32px; text-align: center; }
    .header img { max-height: 60px; max-width: 180px; }
    .body { padding: 32px; color: #1f2937; font-size: 15px; line-height: 1.7; }
    .body p { margin: 0 0 16px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 18px 20px; margin: 20px 0; }
    .card-title { font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin: 0 0 10px; }
    .ref-number { font-size: 22px; font-weight: 700; color: #000000; letter-spacing: 1px; margin: 0; }
    .ref-number a { color: #000000; text-decoration: none; }
    .highlight-box { background-color: #ffffff; border-left: 4px solid #000000; padding: 14px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight-box p { margin: 0 0 6px; }
    .highlight-box strong { color: #000000; }
    .footer { padding: 20px 32px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .event-badge { display: inline-block; background: #000000; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="Mercedes Logo" />
    </div>
    <div class="body">
      ${bodyContent}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Serhan Kombos Otomotiv. All rights reserved.
    </div>
  </div>
</body>
</html>`;

export const eventBadge = () => `<div style="text-align: center; margin-bottom: 8px;">
  <span class="event-badge">Kombos Otomotiv Bingo</span>
</div>`;

export const highlightBox = (content) => `<div class="highlight-box">
  ${content}
</div>`;

export const eventInfo = () => `<p><strong>Event:</strong> Kombos Otomotiv Bingo</p>
<p><strong>Prize:</strong> 500,000 TL cash prize</p>`;
