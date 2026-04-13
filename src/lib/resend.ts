import { Resend } from "resend"
import { buildWhatsAppLink } from "./utils"

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
  whatsappLink, // 👈 FALTABA ESTO
}: {
  clientName: string
  serviceName: string
  date: string
  time: string
  duration: number
  price: string
  shopName: string
  appointmentLink: string
  whatsappLink: string
}) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cita confirmada</title>
</head>
<body style="margin:0;padding:0;background:#050c10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050c10;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00bcd4;border-radius:12px;padding:10px 14px;">
                    <span style="color:#000;font-size:18px;font-weight:900;letter-spacing:-0.5px;">✂ ${shopName}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0d1a22;border:1px solid rgba(201,162,39,0.2);border-radius:20px;overflow:hidden;">

              <!-- Gold top bar -->
              <div style="height:4px;background:linear-gradient(90deg,#00bcd4,#0097a7);"></div>

              <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 32px 8px;">

                <!-- Success icon + title -->
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <div style="width:72px;height:72px;background:linear-gradient(135deg,#00bcd4,#0097a7);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
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
                          <span style="color:#00bcd4;font-size:20px;font-weight:900;">${price}</span>
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
                          <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:#00bcd4;">📲 Recordatorio por WhatsApp</p>
                          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.4);">Te avisaremos 1 hora antes de tu cita.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA button -->
                <tr>
                  <td align="center" style="padding:28px 0 24px;">
                    <a href="${appointmentLink}" style="display:inline-block;background:linear-gradient(135deg,#00bcd4,#0097a7);color:#000;font-size:14px;font-weight:900;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.02em;">
                      Ver mi cita →
                    </a>
                  </td>
                </tr>
<tr>
  <td align="center" style="padding:0 0 32px;">
    <a href="${whatsappLink}" 
       style="display:inline-block;background:#25D366;color:#fff;font-size:14px;font-weight:900;padding:12px 28px;border-radius:12px;text-decoration:none;">
       💬 Confirmar por WhatsApp
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

// ── Reminder email HTML (shared for 1h and 24h) ───────────────────────────
function buildReminderHtml({
  clientName,
  serviceName,
  date,
  time,
  shopName,
  appointmentLink,
  title,
  subtitle,
}: {
  clientName: string
  serviceName: string
  date?: string
  time: string
  shopName: string
  appointmentLink: string
  title: string
  subtitle: string
}) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recordatorio de cita</title>
</head>
<body style="margin:0;padding:0;background:#050c10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050c10;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00bcd4;border-radius:12px;padding:10px 14px;">
                    <span style="color:#000;font-size:18px;font-weight:900;letter-spacing:-0.5px;">✂ ${shopName}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0d1a22;border:1px solid rgba(0,188,212,0.2);border-radius:20px;overflow:hidden;">
              <div style="height:4px;background:linear-gradient(90deg,#00bcd4,#0097a7);"></div>
              <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 32px 8px;">

                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="font-size:48px;margin-bottom:12px;">⏰</div>
                    <h1 style="margin:0 0 6px;color:#ffffff;font-size:24px;font-weight:900;">${title}</h1>
                    <p style="margin:0;color:rgba(255,255,255,0.45);font-size:14px;">Hola ${clientName}, ${subtitle}</p>
                  </td>
                </tr>

                <tr><td style="height:1px;background:rgba(255,255,255,0.06);"></td></tr>

                <tr>
                  <td style="padding:20px 0 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px;">
                      <tr>
                        <td>
                          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;">Servicio</p>
                          <p style="margin:0;font-size:16px;font-weight:700;color:#fff;">${serviceName}</p>
                        </td>
                        <td align="right">
                          ${date ? `<p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;">Fecha</p><p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#fff;">${date}</p>` : ""}
                          <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.1em;">Hora</p>
                          <p style="margin:0;font-size:16px;font-weight:700;color:#00bcd4;">${time}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:28px 0 24px;">
                    <a href="${appointmentLink}" style="display:inline-block;background:linear-gradient(135deg,#00bcd4,#0097a7);color:#000;font-size:14px;font-weight:900;padding:14px 36px;border-radius:12px;text-decoration:none;">
                      Ver o cancelar mi cita →
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 0 0;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">${shopName} · ¡Te esperamos!</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Send reminder email (1h before appointment) ───────────────────────────
export async function sendReminderEmail({
  to,
  clientName,
  serviceName,
  time,
  shopName,
  appointmentLink,
}: {
  to: string
  clientName: string
  serviceName: string
  time: string
  shopName: string
  appointmentLink: string
}) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: FROM,
    to,
    subject: `⏰ Recordatorio — Tu cita de ${serviceName} es en 1 hora`,
    html: buildReminderHtml({ clientName, serviceName, time, shopName, appointmentLink, title: "Tu cita es en 1 hora", subtitle: "prepárate para tu visita." }),
  })
}

// ── Send reminder email (24h before appointment) ─────────────────────────
export async function sendReminder24hEmail({
  to,
  clientName,
  serviceName,
  date,
  time,
  shopName,
  appointmentLink,
}: {
  to: string
  clientName: string
  serviceName: string
  date: string
  time: string
  shopName: string
  appointmentLink: string
}) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: FROM,
    to,
    subject: `📅 Mañana tienes cita — ${serviceName} a las ${time}`,
    html: buildReminderHtml({ clientName, serviceName, date, time, shopName, appointmentLink, title: "Tu cita es mañana", subtitle: "te recordamos tu reserva." }),
  })
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

  const whatsappMessage = `Hola ${clientName}, confirmo mi cita el ${date} a las ${time} en ${shopName}`
const whatsappLink = buildWhatsAppLink(to, whatsappMessage)

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
      whatsappLink
    }),
  })
}
