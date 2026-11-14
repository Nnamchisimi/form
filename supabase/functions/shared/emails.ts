import { EMAIL_FROM, LOGO_URL } from './constants.ts';
import { baseEmailTemplate, eventBadge, highlightBox, bingoCallout, sectionTitle, bodyText, sectionDivider } from './templates.ts';

export async function sendApprovalEmail(
  registration: any,
  customMessage: string | undefined,
  language: string = 'tr',
  ticketImageUrl: string | null = null
) {
  if (!registration?.email) return;

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

  const isTurkish = language === 'tr';
  const subject = isTurkish ? 'Kaydınız onaylandı' : 'Your registration has been approved';
  const greeting = isTurkish ? `Merhaba ${registration.name} ${registration.surname},` : `Hello ${registration.name} ${registration.surname},`;
  const approvedText = isTurkish ? 'Kaydınız onaylandı ve teyit edildi.' : 'Your registration is approved and has been confirmed.';
  const keepRef = isTurkish ? 'Bu referans numarasını saklayın, ileride ihtiyacınız olacaktır.' : 'Please keep this reference number safe, as you will need it later.';
  const note = isTurkish ? 'Bu e-posta başka bir kayıt için kullanılamaz.' : 'Note: This email cannot be used for another registration.';
  const pickupReminder = isTurkish ? 'Lütfen koçanınız ve davetiyeniz ile birlikte etkinlikten önce showroomlarımızdan tombala biletinizi almayı unutmayın.' : 'Please remember to pick up your tombala ticket from our showroom at the address below before the event, bringing along your car registration paper and invitation.';
  const refLabel = isTurkish ? 'Referans No' : 'Reference No';

  const ticketTitle = isTurkish ? 'Kombos Tombala' : 'Kombos Bingo';
  const ticketSubtitle = isTurkish ? 'Davetiye' : 'Invitation';
  const ticketDate = language === 'tr' ? '21 KASIM 2026 11:00 CUMARTESİ' : '21 NOVEMBER 2026 11:00 | SATURDAY';
  const ticketLocation = language === 'tr' ? 'KOMBOS OTOMOTİV LEFKOŞA SHOWROOM' : 'KOMBOS AUTOMOTIVE | LEFKOŞA SHOWROOM';
  const dateLabel = isTurkish ? 'Tarih' : 'Date';
  const locationLabel = isTurkish ? 'Konum' : 'Location';
  const refShort = 'REF';

  const ticketSection = ticketImageUrl
    ? `<div style="text-align:center;margin:24px 0 0;"><img src="${ticketImageUrl}" alt="Ticket" style="max-width:100%;width:720px;height:auto;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.35);display:block;margin:0 auto;" /></div>`
    : `<div style="margin:24px 0 0;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;max-width:720px;margin:0 auto;border-collapse:separate;border-spacing:0;border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);box-shadow:0 20px 60px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.08);">
          <tr>
            <td valign="top" style="padding:32px 32px 32px 40px;background:linear-gradient(135deg,#c4b9ab 0%,#e1ddcc 50%,#fdfaf2 100%);">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:0 0 16px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                      <td valign="middle" style="padding:0 10px 0 0;"><img src="${LOGO_URL}" alt="Mercedes" width="36" height="36" style="width:36px;height:36px;display:block;object-fit:contain;" /></td>
                      <td valign="middle" style="line-height:1.2;">
                        <div style="font-size:20px;font-weight:700;letter-spacing:0.5px;color:#78350f;">Serhan Kombos</div>
                        <div style="font-size:11px;font-weight:600;letter-spacing:2px;color:#6b4c35;">OTOMOTIV</div>
                      </td>
                    </tr></table>
                  </td>
                </tr>
                <tr><td style="padding:0 0 16px 0;"><div style="width:100%;height:1px;background:linear-gradient(90deg,rgba(120,53,15,0.2) 0%,rgba(120,53,15,0.08) 100%);font-size:0;line-height:0;">&nbsp;</div></td></tr>
                <tr><td style="padding:0;">
                  <div style="font-size:24px;font-weight:700;line-height:1.2;letter-spacing:-0.02em;color:#451a03;margin:0 0 4px 0;">${ticketTitle}</div>
                  <div style="font-size:16px;font-weight:600;line-height:1.4;color:#92400e;margin:4px 0 8px 0;">${ticketSubtitle}</div>
                  <div style="font-size:14px;color:#5c4033;line-height:1.6;margin:0 0 0 0;letter-spacing:-0.01em;">${isTurkish ? 'Tombalaya kaydınız tamamlanmış ve onaylanmıştır.' : 'Your registration for the tombola has been successfully completed and confirmed.'}</div>
                  <div style="font-size:14px;color:#5c4033;line-height:1.6;margin:0 0 8px 0;font-weight:700;letter-spacing:-0.01em;">${isTurkish ? 'Lütfen biletinizi showroomlarımızdan temin etmeniz gerekmektedir.' : 'Please collect your ticket from our showrooms.'}</div>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;border-spacing:0;background:rgba(255,255,255,0.55);border:1px solid rgba(180,83,9,0.25);border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(69,26,3,0.08);margin:8px 0 0 0;">
                    <tr>
                      <td valign="top" style="padding:14px 18px;width:33%;min-width:0;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#92400e;opacity:0.8;margin:0 0 4px 0;">${dateLabel} &#128197;</div>
                        <div style="font-size:14px;font-weight:700;color:#451a03;line-height:1.3;word-break:break-word;">${ticketDate}</div>
                      </td>
                      <td valign="top" style="width:1px;background:linear-gradient(to bottom,transparent,rgba(180,83,9,0.35),transparent);font-size:0;line-height:0;">&nbsp;</td>
                      <td valign="top" style="padding:14px 18px;width:34%;min-width:0;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#92400e;opacity:0.8;margin:0 0 4px 0;">${locationLabel}</div>
                        <div style="font-size:14px;font-weight:700;color:#451a03;line-height:1.3;word-break:break-word;">${ticketLocation}</div>
                      </td>
                      <td valign="top" style="width:1px;background:linear-gradient(to bottom,transparent,rgba(180,83,9,0.35),transparent);font-size:0;line-height:0;">&nbsp;</td>
                      <td valign="top" style="padding:14px 18px;width:33%;min-width:0;">
                        <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#92400e;opacity:0.8;margin:0 0 4px 0;">${refShort} #</div>
                        <div style="font-size:14px;font-weight:700;color:#451a03;line-height:1.3;word-break:break-all;">${registration.reference_number || 'KOMBOS-2026'}</div>
                      </td>
                    </tr>
                  </table>
                  <div style="font-size:11px;color:#6b4c35;line-height:1.5;margin:12px 0 0 0;text-align:center;letter-spacing:-0.01em;">${isTurkish ? '* Davetiyeniz ile birlikte showroomlarımızdan tombala biletinizi temin etmeyi unutmayın.' : '*Please don\'t forget to collect your tombola ticket from our showrooms'}</div>
                  <div style="font-size:12px;color:#6b4c35;line-height:1.4;margin:12px 0 0 0;text-align:right;letter-spacing:-0.01em;">&#128222; 0533 871 38 38</div>
                  <div style="font-size:12px;color:#6b4c35;line-height:1.4;margin:12px 0 0 0;text-align:center;font-style:italic;letter-spacing:-0.01em;">&#128205; ${isTurkish ? 'Dr Fazıl küçük Bulvarı Organıze Sanayi Bölgesi/Lefkoşa' : 'Dr Fazıl küçük Bulvarı Organıze Sanayi Bölgesi/Lefkoşa'}</div>
                </td></tr>
              </table>
            </td>
            <td valign="top" width="220" style="width:220px;background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:0;">
              <img src="https://urtmleicijluwonalidr.supabase.co/storage/v1/object/public/logos/ticketimg.jpg" alt="Ticket" width="220" style="width:220px;height:100%;min-height:400px;display:block;object-fit:cover;border:0;" />
            </td>
          </tr>
        </table>
      </div>`;

  const addressAfterTicket = `<p style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:16px 0 0;padding-top:16px;border-top:1px solid #e5e7eb;font-size:13px;color:#6b4c35;line-height:1.6;font-weight:500;text-align:center;">Showroom Adresi:<br>Dr Fazıl küçük Bulvarı Organıze Sanayi Bölgesi/Lefkoşa</p>`;

  const html = baseEmailTemplate(isTurkish ? 'Kayıt Onaylandı' : 'Registration Approved', `
    ${eventBadge(isTurkish)}
    ${sectionTitle(greeting)}
    ${bingoCallout(approvedText)}
    ${customMessage ? bodyText(customMessage.replace(/\n/g, '</p><p style="margin:0 0 16px;color:#444444;">')) : ''}
    ${bodyText(keepRef)}
    ${bodyText(note)}
    ${bodyText(pickupReminder)}
    ${registration.reference_number ? highlightBox(`<p style="margin:0 0 6px;color:#1a1a1a;"><strong>${refLabel}:</strong> ${registration.reference_number}</p>`) : ''}
    ${ticketSection}
    ${addressAfterTicket}
  `);

  const res = await fetch(`${supabaseUrl}/functions/v1/rapid-service`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      to: registration.email,
      from: EMAIL_FROM,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Email send failed (${res.status}): ${text}`);
  }

  return await res.json();
}