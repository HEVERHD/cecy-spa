"use client"

export function PaymentBanner() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: "linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #b91c1c 100%)",
        borderBottom: "4px solid #fbbf24",
        padding: "18px 24px",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#fff",
          fontWeight: 800,
          fontSize: "clamp(15px, 3vw, 22px)",
          letterSpacing: "0.03em",
          lineHeight: 1.4,
        }}
      >
        ⚠️ SERVICIO SUSPENDIDO POR FALTA DE PAGO ⚠️
      </p>
      <p
        style={{
          margin: "6px 0 0",
          color: "#fde68a",
          fontWeight: 600,
          fontSize: "clamp(12px, 2.2vw, 16px)",
        }}
      >
        La mensualidad de este sistema no ha sido cancelada. Contacte al administrador para restablecer el servicio completo.
      </p>
    </div>
  )
}
