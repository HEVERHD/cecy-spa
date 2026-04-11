export default function ParallaxBg() {
  return (
    <div
      className="fixed inset-0 z-0"
      style={{
        background: `
          radial-gradient(circle at 15% 20%, rgba(255, 95, 195, 0.16), transparent 24%),
          radial-gradient(circle at 82% 18%, rgba(181, 23, 158, 0.18), transparent 26%),
          radial-gradient(circle at 55% 70%, rgba(17, 214, 143, 0.10), transparent 28%),
          linear-gradient(135deg, #0d020b 0%, #160312 42%, #22071d 100%)
        `,
      }}
    />
  )
}
