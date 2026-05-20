import { useStore } from '../../app/providers/store'

export const LogoComplete = ({ className }) => {
  const isDarkMode = useStore((state) => state.isDarkMode)
  const fillColor = isDarkMode ? '#ffffff' : '#1f2937'

  return (
    <svg
      viewBox="0 0 151.18111 46.374808"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(-1152.9474,-463.84842)">
        <g transform="matrix(0.49429608,0,0,0.49429608,1109.4264,275.36394)">
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
            <tspan x="105.80782" y="450.72842">Bykor</tspan>
          </text>
          <g transform="matrix(1.688767,0,0,1.688767,-242.91308,-310.4899)">
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
