
export enum Screen {
    Welcome,
    Game,
    Result,
    Ranking,
}

export interface Player {
    id: string;
    name: string;
    neighborhood: string;
    whatsapp?: string;
    highScore: number;
    attempts: number;
}

export interface GameStats {
    score: number;
    maxCombo: number;
}

export interface NeighborhoodStats {
    name: string;
    totalScore: number;
    totalPlayers: number;
    averageScore: number;
}
