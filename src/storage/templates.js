import { LOGO_URL } from './constants';

export const baseEmailTemplate = (title, bodyContent) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);">
    <div style="background-color:#000000;padding:22px 32px;text-align:center;position:relative;">
      <img src="${LOGO_URL}" alt="Mercedes Logo" style="max-height:56px;max-width:160px;position:relative;z-index:2;" />
    </div>
    <div style="padding:28px 32px;color:#1f2937;font-size:15px;line-height:1.7;">
      ${bodyContent}
    </div>
    <div style="padding:18px 32px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #fde68a;background:#fffbf0;">
      &copy; ${new Date().getFullYear()} Serhan Kombos Otomotiv. All rights reserved.
    </div>
  </div>
</body>
</html>`;

export const eventBadge = () => `<div style="text-align:center;margin-bottom:10px;">
  <span style="display:inline-block;background:#7c2d12;color:#ffffff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;letter-spacing:0.6px;">Kombos Otomotiv Bingo</span>
</div>`;

export const highlightBox = (content) => `<div style="background:#fffbeb;border-left:4px solid #f59e0b;padding:14px 16px;border-radius:0 10px 10px 0;margin:16px 0;">
  ${content}
</div>`;

export const eventInfo = () => `<p style="margin:0 0 6px;"><strong>Event:</strong> Kombos Otomotiv Bingo</p>
<p style="margin:0;"><strong>Prize:</strong> 500,000 TL cash prize</p>`;

export const bingoCallout = (text = 'Your registration is confirmed.') => `<div style="background:linear-gradient(135deg,#fff7ed 0%,#fffbeb 100%);border:1px solid #fdba74;border-radius:12px;padding:14px 16px;margin:14px 0;">
  <p style="margin:0;color:#7c2d12;">${text}</p>
</div>`;
