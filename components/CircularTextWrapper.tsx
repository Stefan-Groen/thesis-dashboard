'use client'

import CircularText from "./CircularText"

export default function CircularTextWrapper() {
    return (
        <CircularText
            text='SIGNALSHARK*SIGNALSHARK*'
            onHover="slowDown"
            spinDuration={40}
        />
    );
}