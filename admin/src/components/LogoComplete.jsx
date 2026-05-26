export const LogoComplete = ({ className = 'h-8' }) => (
    <svg className={className} viewBox='0 0 180 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='40' height='40' rx='8' fill='#3b7597' />
        <path d='M12 14h16v4h-6v12h-4V18h-6v-4z' fill='#fff' />
        <text x='48' y='28' fontFamily='system-ui' fontWeight='700' fontSize='22' fill='var(--on-surface)'>Dyno</text>
        <text x='100' y='28' fontFamily='system-ui' fontWeight='300' fontSize='22' fill='var(--accent)'>POS</text>
    </svg>
)
