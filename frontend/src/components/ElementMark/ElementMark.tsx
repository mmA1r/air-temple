import "./ElementMark.scss";

function ElementMark() {
    return (
        <svg className="element-mark" viewBox="0 0 320 320" role="img" aria-label="Air Temple elemental mark">
            <defs>
                <linearGradient id="waterAirGradient" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--mark-a)" />
                    <stop offset="100%" stopColor="var(--mark-b)" />
                </linearGradient>
            </defs>
            <circle className="element-mark__orbit element-mark__orbit--outer" cx="160" cy="160" r="120" />
            <circle className="element-mark__orbit element-mark__orbit--inner" cx="160" cy="160" r="72" />
            <path className="element-mark__wave" d="M64 166 C100 116 130 214 164 164 C200 112 226 212 258 158" />
            <path className="element-mark__flame" d="M160 58 C224 122 220 194 160 262 C100 194 96 122 160 58Z" />
        </svg>
    );
}

export default ElementMark;
