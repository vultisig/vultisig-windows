export const VultisigLogoPattern = () => (
  <svg
    width="280"
    height="280"
    viewBox="0 0 280 280"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g opacity="0.4">
      {/* Outer ring */}
      <circle
        cx="140"
        cy="140"
        r="120"
        stroke="url(#gradient1)"
        strokeWidth="3"
        fill="none"
      />

      {/* Middle ring */}
      <circle
        cx="140"
        cy="140"
        r="90"
        stroke="url(#gradient2)"
        strokeWidth="2"
        fill="none"
      />

      {/* Vultisig logo shape - simplified geometric pattern */}
      <path
        d="M140 60 L180 120 L160 180 L120 180 L100 120 Z"
        stroke="url(#gradient3)"
        strokeWidth="4"
        fill="none"
        strokeLinejoin="round"
      />

      {/* Inner accent lines */}
      <line
        x1="140"
        y1="80"
        x2="140"
        y2="160"
        stroke="url(#gradient4)"
        strokeWidth="2"
      />
      <line
        x1="110"
        y1="120"
        x2="170"
        y2="120"
        stroke="url(#gradient4)"
        strokeWidth="2"
      />
    </g>

    <defs>
      <linearGradient id="gradient1" x1="0" y1="0" x2="280" y2="280">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>
      <linearGradient id="gradient2" x1="0" y1="0" x2="280" y2="280">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#4ade80" />
      </linearGradient>
      <linearGradient id="gradient3" x1="100" y1="60" x2="180" y2="180">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="50%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#4ade80" />
      </linearGradient>
      <linearGradient id="gradient4" x1="110" y1="80" x2="170" y2="160">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
      </linearGradient>
    </defs>
  </svg>
)
