
import { Player, NeighborhoodStats } from '../types';

const PLAYER_KEY = 'estouraTudo_player';
const ALL_PLAYERS_KEY = 'estouraTudo_allPlayers';
const NEIGHBORHOODS_KEY = 'estouraTudo_neighborhoods';

export class StorageService {
    private static getAllPlayers(): Player[] {
        const players = localStorage.getItem(ALL_PLAYERS_KEY);
        try {
            return players ? JSON.parse(players) : [];
        } catch (e) {
            console.error("Failed to parse all players from localStorage:", e);
            localStorage.removeItem(ALL_PLAYERS_KEY);
            return [];
        }
    }
    
    private static saveAllPlayers(players: Player[]): void {
        localStorage.setItem(ALL_PLAYERS_KEY, JSON.stringify(players));
    }
    
    private static getAllNeighborhoods(): Record<string, Omit<NeighborhoodStats, 'name' | 'averageScore'>> {
        const neighborhoods = localStorage.getItem(NEIGHBORHOODS_KEY);
        try {
            return neighborhoods ? JSON.parse(neighborhoods) : {};
        } catch (e) {
            console.error("Failed to parse neighborhoods from localStorage:", e);
            localStorage.removeItem(NEIGHBORHOODS_KEY);
            return {};
        }
    }

    private static saveAllNeighborhoods(neighborhoods: Record<string, Omit<NeighborhoodStats, 'name' | 'averageScore'>>): void {
        localStorage.setItem(NEIGHBORHOODS_KEY, JSON.stringify(neighborhoods));
    }

    static createPlayer(name: string, neighborhood: string, whatsapp?: string): Player {
        const newPlayer: Player = {
            id: `player_${Date.now()}`,
            name,
            neighborhood,
            whatsapp,
            highScore: 0,
            attempts: 0,
        };
        localStorage.setItem(PLAYER_KEY, JSON.stringify(newPlayer));
        
        const allPlayers = this.getAllPlayers();
        allPlayers.push(newPlayer);
        this.saveAllPlayers(allPlayers);
        
        this.updateNeighborhoodStats(neighborhood, 0, true);

        return newPlayer;
    }

    static getPlayer(): Player | null {
        const player = localStorage.getItem(PLAYER_KEY);
        try {
            return player ? JSON.parse(player) : null;
        } catch (e) {
            console.error("Failed to parse player from localStorage:", e);
            localStorage.removeItem(PLAYER_KEY);
            return null;
        }
    }
    
    static updatePlayerStats(playerId: string, newScore: number): Player | null {
        let player = this.getPlayer();
        if (!player || player.id !== playerId) {
            const allPlayers = this.getAllPlayers();
            player = allPlayers.find(p => p.id === playerId) || null;
        }

        if (!player) {
            console.error("Player not found for stats update:", playerId);
            return null;
        }

        player.attempts += 1;
        if (newScore > player.highScore) {
            player.highScore = newScore;
        }

        localStorage.setItem(PLAYER_KEY, JSON.stringify(player));

        const allPlayers = this.getAllPlayers();
        const playerIndex = allPlayers.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            allPlayers[playerIndex] = player;
            this.saveAllPlayers(allPlayers);
        } else {
            console.warn("Updated player was not found in the master list. This may indicate a data sync issue.");
        }

        return player;
    }
    
    static updateNeighborhoodStats(neighborhoodName: string, score: number, isNewPlayer: boolean = false): Record<string, NeighborhoodStats> {
        const neighborhoods = this.getAllNeighborhoods();
        const name = neighborhoodName.trim().toLowerCase();

        if (!neighborhoods[name]) {
            neighborhoods[name] = { totalScore: 0, totalPlayers: 0 };
        }
        
        if (isNewPlayer) {
             neighborhoods[name].totalPlayers += 1;
        }
        
        neighborhoods[name].totalScore += score;
        this.saveAllNeighborhoods(neighborhoods);

        return this.getAggregatedNeighborhoods();
    }
    
    static getTopPlayers(limit: number = 10): Player[] {
        const allPlayers = this.getAllPlayers();
        return allPlayers.sort((a, b) => b.highScore - a.highScore).slice(0, limit);
    }
    
    static getAggregatedNeighborhoods(): Record<string, NeighborhoodStats> {
        const neighborhoodsData = this.getAllNeighborhoods();
        const aggregated: Record<string, NeighborhoodStats> = {};

        for (const name in neighborhoodsData) {
            const data = neighborhoodsData[name];
            aggregated[name] = {
                name: this.titleCase(name),
                totalScore: data.totalScore,
                totalPlayers: data.totalPlayers,
                averageScore: data.totalPlayers > 0 ? Math.round(data.totalScore / data.totalPlayers) : 0,
            };
        }
        return aggregated;
    }

    static getTopNeighborhoods(limit: number = 10): NeighborhoodStats[] {
        const aggregated = Object.values(this.getAggregatedNeighborhoods());
        return aggregated.sort((a, b) => b.averageScore - a.averageScore).slice(0, limit);
    }

    private static titleCase(str: string): string {
        return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
}
