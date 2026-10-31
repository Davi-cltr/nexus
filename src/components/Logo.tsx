/** marca do Nexus: três ideias e as conexões entre elas */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="flex-none">
      <path d="M7 22.5C11.5 13 18 9.5 25.5 8" stroke="var(--acc)" strokeOpacity="0.75" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 22.5C13 24.8 18.5 24.5 24 25.5" stroke="var(--acc)" strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25.5 8C26.5 14 25.8 20 24 25.5" stroke="#fff" strokeOpacity="0.28" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 2.5" />
      <circle cx="7" cy="22.5" r="5" fill="var(--acc)" fillOpacity="0.18" />
      <circle cx="7" cy="22.5" r="2.8" fill="#fff" />
      <circle cx="25.5" cy="8" r="2.3" fill="var(--acc)" />
      <circle cx="24" cy="25.5" r="1.8" fill="var(--acc)" fillOpacity="0.85" />
    </svg>
  )
}
