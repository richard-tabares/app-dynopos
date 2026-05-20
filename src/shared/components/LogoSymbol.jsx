import { useStore } from '../../app/providers/store'

export const LogoSymbol = ({ className }) => {
  const isDarkMode = useStore((state) => state.isDarkMode)
  const fillColor = isDarkMode ? '#ffffff' : '#111827'

  return (
    <svg
      viewBox="0 0 127.99999 128"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(-1132.5197,-36.755901)">
        <g transform="matrix(1.4408471,0,0,1.4408471,975.38733,-505.07956)">
          <text
            x="105.80782"
            y="450.72842"
            style={{
              fontStyle: 'normal',
              fontVariant: 'normal',
              fontWeight: 'normal',
              fontStretch: 'normal',
              fontSize: '86.5371px',
              fontFamily: "'Russo One'",
              fontVariantLigatures: 'normal',
              fontVariantCaps: 'normal',
              fontVariantNumeric: 'normal',
              fontVariantEastAsian: 'normal',
              writingMode: 'lr-tb',
              direction: 'ltr',
              fill: fillColor,
            }}
          >
            <tspan x="105.80782" y="450.72842">B</tspan>
          </text>
          <g transform="matrix(1.688767,0,0,1.688767,-417.90941,-310.4899)">
            <rect
              width="10.816064"
              height="10.738976"
              x="352.67816"
              y="440.05194"
              fill="#00ffff"
            />
          </g>
        </g>
      </g>
    </svg>
  )
}
