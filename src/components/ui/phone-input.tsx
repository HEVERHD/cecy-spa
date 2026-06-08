"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"

type Country = {
  code: string
  name: string
  dial: string
  flag: string
}

const COUNTRIES: Country[] = [
  { code: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { code: "US", name: "Estados Unidos", dial: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canadá", dial: "+1", flag: "🇨🇦" },
  { code: "MX", name: "México", dial: "+52", flag: "🇲🇽" },
  { code: "ES", name: "España", dial: "+34", flag: "🇪🇸" },
  { code: "VE", name: "Venezuela", dial: "+58", flag: "🇻🇪" },
  { code: "EC", name: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { code: "PE", name: "Perú", dial: "+51", flag: "🇵🇪" },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
  { code: "BR", name: "Brasil", dial: "+55", flag: "🇧🇷" },
  { code: "PA", name: "Panamá", dial: "+507", flag: "🇵🇦" },
  { code: "CR", name: "Costa Rica", dial: "+506", flag: "🇨🇷" },
  { code: "GT", name: "Guatemala", dial: "+502", flag: "🇬🇹" },
  { code: "IT", name: "Italia", dial: "+39", flag: "🇮🇹" },
  { code: "FR", name: "Francia", dial: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Alemania", dial: "+49", flag: "🇩🇪" },
]

// Sort by dial length descending to avoid short-prefix false matches (e.g. +57 vs +593)
const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)

function parsePhone(value: string): { country: Country; local: string } {
  const defaultCountry = COUNTRIES[0] // Colombia
  if (!value) return { country: defaultCountry, local: "" }
  for (const c of SORTED_COUNTRIES) {
    if (value.startsWith(c.dial)) {
      return { country: c, local: value.slice(c.dial.length) }
    }
  }
  return { country: defaultCountry, local: value }
}

type PhoneInputProps = {
  value: string
  onChange: (value: string) => void
  /** className applied to the outer wrapper (use for width/layout, e.g. "w-full") */
  className?: string
  placeholder?: string
  required?: boolean
  /** Tailwind bg class for both button and input — default: bg-[#080f16] */
  bg?: string
  /** Tailwind border class — default: border-[#0e2530] */
  border?: string
  /** Tailwind padding class — default: p-3 */
  padding?: string
}

export function PhoneInput({
  value,
  onChange,
  className = "",
  placeholder = "300 123 4567",
  required,
  bg = "bg-[#080f16]",
  border = "border-[#0e2530]",
  padding = "p-3",
}: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const [selectedCountry, setSelectedCountry] = useState<Country>(() => parsePhone(value).country)
  const [localNumber, setLocalNumber] = useState<string>(() => parsePhone(value).local)

  // Sync when value changes from outside (e.g., localStorage pre-fill, autocomplete)
  useEffect(() => {
    const combined = selectedCountry.dial + localNumber
    if (value !== combined) {
      const { country, local } = parsePhone(value)
      setSelectedCountry(country)
      setLocalNumber(local)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 20)
  }, [open])

  const filtered = COUNTRIES.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(q)
    )
  })

  const selectCountry = (c: Country) => {
    setSelectedCountry(c)
    setOpen(false)
    setSearch("")
    onChange(c.dial + localNumber)
  }

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value
    setLocalNumber(num)
    onChange(selectedCountry.dial + num)
  }

  return (
    <div className={`relative flex ${className}`} ref={wrapperRef}>
      {/* ── Country selector button ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 ${padding} ${bg} border ${border} rounded-l-xl text-white hover:border-[#00bcd4]/60 transition-colors border-r-0 shrink-0`}
        aria-label="Seleccionar país"
      >
        <span className="text-xl leading-none">{selectedCountry.flag}</span>
        <span className="text-white/50 text-xs font-mono whitespace-nowrap">{selectedCountry.dial}</span>
        <ChevronDown
          size={12}
          className={`text-white/30 transition-transform duration-200 ml-0.5 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Divider ── */}
      <div className={`w-px self-stretch ${bg} border-y ${border} border-r-0 border-l border-l-white/10`} />

      {/* ── Number input ── */}
      <input
        type="tel"
        value={localNumber}
        onChange={handleNumber}
        placeholder={placeholder}
        required={required}
        className={`flex-1 min-w-0 ${padding} ${bg} border ${border} rounded-r-xl text-white placeholder-white/30 focus:border-[#00bcd4] focus:outline-none transition-colors text-sm border-l-0`}
      />

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-72 bg-[#0d1c2b] border border-[#0e2530] rounded-2xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2.5 border-b border-white/8">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar país o código…"
              className="w-full px-3 py-2 bg-[#080f16] border border-[#0e2530] rounded-xl text-white text-xs placeholder-white/30 focus:border-[#00bcd4] focus:outline-none"
            />
          </div>

          {/* Country list */}
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-white/30 py-5">Sin resultados</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // keep focus on number input
                  onClick={() => selectCountry(c)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    selectedCountry.code === c.code
                      ? "bg-[#00bcd4]/12 text-[#00bcd4]"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-2xl leading-none shrink-0">{c.flag}</span>
                  <span className="flex-1 text-sm">{c.name}</span>
                  <span className="text-xs text-white/35 font-mono shrink-0">{c.dial}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
