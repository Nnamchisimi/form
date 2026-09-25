import { LOGO_URL } from './constants';

export const baseEmailTemplate = (title, bodyContent) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>${title}</title>
  <style>
    @media print {
      body * { visibility: hidden; }
      .ticket-print-area, .ticket-print-area * { visibility: visible; }
      .ticket-print-area { position: absolute; left: 0; top: 0; width: 100%; }
      .no-print { display: none !important; }
    }
    @media (prefers-color-scheme: dark) {
      body { background-color: #0f0f0f !important; }
      .email-card { background-color: #111827 !important; box-shadow: none !important; }
      .email-header { background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important; border-bottom-color: #374151 !important; }
      .email-body { color: #f3f4f6 !important; }
      .section-title { color: #f9fafb !important; }
      .body-text { color: #e5e7eb !important; }
      .highlight-box { background-color: #1f2937 !important; border-left-color: #4b5563 !important; color: #e5e7eb !important; }
      .event-badge { background: linear-gradient(135deg, #374151 0%, #1f2937 100%) !important; color: #f3f4f6 !important; }
      .reference-box { background-color: #1f2937 !important; border-color: #374151 !important; color: #f9fafb !important; }
      .reference-label { color: #9ca3af !important; }
      .reference-value { color: #f9fafb !important; }
      .reference-note { color: #9ca3af !important; }
      .footer { color: #9ca3af !important; border-top-color: #374151 !important; background-color: #0f0f0f !important; }
      .primary-button { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important; color: #ffffff !important; }
      .bingo-callout { background-color: #1f2937 !important; border-color: #374151 !important; }
      .callout-text { color: #f3f4f6 !important; }
    }
    @media (max-width: 640px) {
      .email-card { border-radius: 14px !important; margin: 16px auto !important; }
      .email-header { padding: 20px 18px !important; }
      .email-header img { max-height: 42px !important; max-width: 120px !important; }
      .email-body { padding: 22px 18px !important; font-size: 14px !important; }
      .section-title { font-size: 18px !important; }
      .reference-value { font-size: 22px !important; }
      .primary-button { padding: 12px 22px !important; font-size: 13px !important; }
      .event-badge { font-size: 12px !important; padding: 8px 18px !important; }
      .bingo-callout { padding: 16px 18px !important; }
      .highlight-box { padding: 16px 18px !important; }
      .footer { padding: 18px !important; font-size: 11px !important; }
      .email-card > div { padding-left: 18px !important; padding-right: 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div class="email-card" style="max-width:720px;width:92vw;margin:24px auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.12);">
    <div class="email-header" style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:28px 32px;text-align:center;position:relative;border-bottom:3px solid #444444;">
      <img src="${LOGO_URL}" alt="Mercedes Logo" style="max-height:56px;max-width:160px;position:relative;z-index:2;" />
    </div>
    <div class="email-body" style="padding:32px;color:#1a1a1a;font-size:15px;line-height:1.7;">
      ${bodyContent}
    </div>
    <div class="footer no-print" style="padding:20px 32px;text-align:center;color:#888888;font-size:11px;border-top:1px solid #e5e5e5;background:#fafafa;">
      &copy; ${new Date().getFullYear()} Serhan Kombos Otomotiv. All rights reserved.
    </div>
  </div>
</body>
</html>`;

export const eventBadge = (isTurkish = false) => `<div style="text-align:center;margin-bottom:24px;">
  <span class="event-badge" style="display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#1a1a1a 0%,#333333 100%);color:#ffffff;padding:10px 24px;border-radius:25px;font-size:13px;font-weight:700;letter-spacing:0.8px;box-shadow:0 4px 15px rgba(0,0,0,0.2);">
    <span style="width:8px;height:8px;background:#ffffff;border-radius:50%;display:inline-block;opacity:0.9;"></span>
    ${isTurkish ? 'Kombos Otomotiv Tombala' : 'Kombos Otomotiv Bingo'}
  </span>
</div>`;

export const highlightBox = (content) => `<div class="highlight-box" style="background:#f9f9f9;border-left:4px solid #1a1a1a;padding:18px 20px;border-radius:0 12px 12px 0;margin:20px 0;color:#1a1a1a;">
  ${content}
</div>`;

export const eventInfo = (isTurkish = false) => `<p style="margin:0 0 8px;color:#333333;"><strong>${isTurkish ? 'Etkinlik' : 'Event'}:</strong> ${isTurkish ? 'Kombos Otomotiv Tombala' : 'Kombos Otomotiv Bingo'}</p>
<p style="margin:0;color:#333333;"><strong>${isTurkish ? 'Ödül' : 'Prize'}:</strong> ${isTurkish ? '500.000 TL nakit ödül' : '500,000 TL cash prize'}</p>`;

export const bingoCallout = (text = 'Your registration is confirmed.') => `<div class="bingo-callout" style="background:#f9f9f9;border:2px solid #1a1a1a;border-radius:12px;padding:18px 20px;margin:18px 0;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
  <p class="callout-text" style="margin:0;color:#1a1a1a;font-size:15px;font-weight:600;">${text}</p>
</div>`;

export const primaryButton = (href, label) => `<a class="primary-button" href="${href}" style="display:inline-block;background:linear-gradient(135deg,#1a1a1a 0%,#333333 100%);color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin:16px 0;box-shadow:0 4px 15px rgba(0,0,0,0.25);text-align:center;">${label}</a>`;

export const sectionDivider = () => `<div style="height:1px;background:linear-gradient(90deg,transparent,#e5e7eb,transparent);margin:28px 0;"></div>`;

export const sectionTitle = (text) => `<p class="section-title" style="font-size:20px;font-weight:700;color:#1a1a1a;margin:0 0 6px;line-height:1.3;">${text}</p>`;

export const bodyText = (text) => `<p class="body-text" style="margin:0 0 16px;color:#444444;line-height:1.6;">${text}</p>`;

export const smallText = (text) => `<p class="small-text" style="margin:0;font-size:12px;color:#888888;line-height:1.5;">${text}</p>`;
