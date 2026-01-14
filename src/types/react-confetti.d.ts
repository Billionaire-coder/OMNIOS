declare module 'react-confetti' {
    import React from 'react';
    export interface ConfettiProps {
        width: number;
        height: number;
        opacity?: number;
        numberOfPieces?: number;
        recycle?: boolean;
        run?: boolean;
        wind?: number;
        gravity?: number;
        initialVelocityX?: number;
        initialVelocityY?: number;
        colors?: string[];
        /* Add other props as needed */
    }
    export default class Confetti extends React.Component<ConfettiProps> { }
}
