import type { ReactNode } from "react";

import type { IArcControlStyle } from "../homeRimArc";
import "./HomeRimControl.scss";

interface IHomeRimControlProps {
    className: string;
    style: IArcControlStyle;
    label: string;
    labelId: string;
    labelPath: string;
    startOffset: string;
    ariaLabel: string;
    onClick: () => void;
    children: ReactNode;
}

function HomeRimControl(props: IHomeRimControlProps) {
    return (
        <div className={`home-rim-control ${props.className}`} style={props.style}>
            <svg className="home-rim-control__text" viewBox="0 0 120 76" aria-hidden="true">
                <path className="home-rim-control__text-path" id={props.labelId} d={props.labelPath} />
                <text className="home-rim-control__text-copy">
                    <textPath className="home-rim-control__text-line" href={`#${props.labelId}`} startOffset={props.startOffset}>
                        {props.label}
                    </textPath>
                </text>
            </svg>
            <button className="home-rim-control__orb" type="button" onClick={props.onClick} aria-label={props.ariaLabel}>
                {props.children}
            </button>
        </div>
    );
}

export default HomeRimControl;
