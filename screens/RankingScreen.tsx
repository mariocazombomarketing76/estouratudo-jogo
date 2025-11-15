
import React, { useState, useEffect } from 'react';
import { Player, NeighborhoodStats } from '../types';
import { StorageService } from '../services/storageService';
import { useAppContext } from '../App';

interface RankingScreenProps {
    onBack: () => void;
    currentPlayer: Player | null;
}

const RankingScreen: React.FC<RankingScreenProps> = ({ onBack, currentPlayer }) => {
    const [topPlayers, setTopPlayers] = useState<Player[]>([]);
    const [topNeighborhoods, setTopNeighborhoods] = useState<NeighborhoodStats[]>([]);
    const { playButtonClickSound } = useAppContext();

    useEffect(() => {
        setTopPlayers(StorageService.getTopPlayers(10));
        setTopNeighborhoods(StorageService.getTopNeighborhoods(10));
    }, []);

    const handleBackClick = () => {
        playButtonClickSound();
        onBack();
    }

    const getMedal = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `${index + 1}.`;
    };

    return (
        <div className="w-full max-w-md text-center flex flex-col items-center justify-start p-4 bg-black/70 rounded-2xl border-2 border-cyan-400 neon-box animate-fade-in h-full">
            <h1 className="text-4xl font-bold mb-6 neon-text">Ranking Global</h1>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-2xl gold-text mb-3">Top Jogadores</h2>
                    <ul className="space-y-2 text-left">
                        {topPlayers.map((player, index) => (
                            <li key={player.id} className={`p-2 rounded-lg flex justify-between items-center ${currentPlayer?.id === player.id ? 'bg-cyan-800/50' : 'bg-gray-900/50'}`}>
                                <span>{getMedal(index)} {player.name}</span>
                                <span className="font-bold text-white">{player.highScore}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl gold-text mb-3">Top Bairros</h2>
                    <ul className="space-y-2 text-left">
                        {topNeighborhoods.map((bairro, index) => (
                            <li key={bairro.name} className={`p-2 rounded-lg flex justify-between items-center ${currentPlayer?.neighborhood.toLowerCase() === bairro.name.toLowerCase() ? 'bg-cyan-800/50' : 'bg-gray-900/50'}`}>
                                <span>{getMedal(index)} {bairro.name}</span>
                                <span className="font-bold text-white">{bairro.averageScore}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <button onClick={handleBackClick} className="mt-8 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,0,0.8)]">
                Voltar
            </button>
        </div>
    );
};

export default RankingScreen;
