import { Resend } from "resend"

const FROM = process.env.RESEND_FROM || "onboarding@resend.dev"

// ── HTML email template ────────────────────────────────────────────────────
function buildConfirmationHtml({
  clientName,
  serviceName,
  date,
  time,
  duration,
  price,
  shopName,
  appointmentLink,
}: {
  clientName: string
  serviceName: string
  date: string
  time: string
  duration: number
  price: string
  shopName: string
  appointmentLink: string
}) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita confirmada</title>
</head>
<body style="margin:0;padding:0;background:#060c17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060c17;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#c9a227;border-radius:12px;padding:10px 14px;">
                    <span style="color:#000;font-size:18px;font-weight:900;letter-spacing:-0.5px;">✂ ${shopName}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0f1a2e;border:1px solid rgba(201,162,39,0.2);border-radius:20px;overflow:hidden;">

              <!-- Gold top bar -->
              <div style="height:4px;background:linear-gradient(90deg,#c9a227,#a88520);"></div>

              <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 32px 8px;">

                <!-- Success icon + title -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <div style="width:72px;height:72px;background:linear-gradient(135deg,#c9a227,#a88520);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                      <span style="font-size:32px;line-height:72px;">✂</span>
                    </div>
                    <h1 style="margin:12px 0 6px;color:#ffffff;font-size:26px;font-weight:900;">¡Cita Confirmada!</h1>
                    <p style="margin:0;color:rgba(255,255,255,0.45);font-size:14px;">Hola ${clientName}, tu reserva está lista.</p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr><td style="height:1px;background:rgba(255,255,255,0.06);"></td></tr>

                <!-- Service row -->
                <tr>
                  <td style="padding:20px 0 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0 0 3px;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;">Servicio</p>
                          <p style="margin:0;font-size:17px;font-weight:700;color:#fff;">${serviceName}</p>
                        </td>
                        <td align="right">
                          <span style="color:#c9a227;font-size:20px;font-weight:900;">${price}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Date + Time grid -->
                <tr>
                  <td style="padding:16px 0 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="48%" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px;">
                          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;">📅 Fecha</p>
                          <p style="margin:0;font-size:13px;font-weight:600;color:#fff;">${date}</p>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:14px;">
                          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.08em;">🕐 Hora</p>
                          <p style="margin:0;font-size:13px;font-weight:600;color:#fff;">${time}</p>
                          <p style="margin:3px 0 0;font-size:11px;color:rgba(255,255,255,0.3);">${duration} min</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- WhatsApp reminder badge -->
                <tr>
                  <td style="padding:16px 0 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(201,162,39,0.06);border:1px solid rgba(201,162,39,0.18);border-radius:12px;padding:14px;">
                      <tr>
                        <td>
                          <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#c9a227;">📲 Recordatorio por WhatsApp</p>
                          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">Te avisaremos 1 hora antes de tu cita.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA button -->
                <tr>
                  <td align="center" style="padding:28px 0 24px;">
                    <a href="${appointmentLink}" style="display:inline-block;background:linear-gradient(135deg,#c9a227,#a88520);color:#000;font-size:14px;font-weight:900;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.02em;">
                      Ver mi cita →
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0 0;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">
                ${shopName} · Tu look habla antes que tú.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Send confirmation email ────────────────────────────────────────────────
export async function sendConfirmationEmail({
  to,
  clientName,
  serviceName,
  date,
  time,
  duration,
  price,
  shopName,
  appointmentLink,
}: {
  to: string
  clientName: string
  serviceName: string
  date: string
  time: string
  duration: number
  price: string
  shopName: string
  appointmentLink: string
}) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: FROM,
    to,
    subject: `✂ Cita confirmada — ${serviceName} · ${date} ${time}`,
    html: buildConfirmationHtml({
      clientName,
      serviceName,
      date,
      time,
      duration,
      price,
      shopName,
      appointmentLink,
    }),
  })
}
