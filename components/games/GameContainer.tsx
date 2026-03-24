
import React from 'react';
import { GameMode, GameProps } from '@/lib/types/game';
import { StandardGame } from './StandardGame';
import { RacingGame } from './RacingGame';
import { ObstacleGame } from './ObstacleGame';

interface GameContainerProps extends GameProps {
    mode: GameMode;
}

export const GameContainer: React.FC<GameContainerProps> = (props) => {
    switch (props.mode) {
        case 'racing':
            return <RacingGame {...props} />;
        case 'obstacle':
            return <ObstacleGame {...props} />;
        case 'standard':
        default:
            return <StandardGame {...props} />;
    }
};
