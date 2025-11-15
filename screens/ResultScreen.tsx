
import React, { useEffect, useState } from 'react';
import { Player, GameStats } from '../types';
import { StorageService } from '../services/storageService';
import { useAppContext } from '../App';

interface ResultScreenProps {
    stats: GameStats;
    player: Player;
    onPlayAgain: () => void;
    onShowRanking: () => void;
    onBackToWelcome: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ stats, player, onPlayAgain, onShowRanking, onBackToWelcome }) => {
    const [neighborhoodRank, setNeighborhoodRank] = useState<number | null>(null);
    const { playButtonClickSound } = useAppContext();

    useEffect(() => {
        const topNeighborhoods = StorageService.getTopNeighborhoods(100);
        const rank = topNeighborhoods.findIndex(n => n.name.toLowerCase() === player.neighborhood.toLowerCase()) + 1;
        setNeighborhoodRank(rank > 0 ? rank : null);
    }, [player.neighborhood]);

    const handlePlayAgainClick = () => {
        playButtonClickSound();
        onPlayAgain();
    }
    
    const handleRankingClick = () => {
        playButtonClickSound();
        onShowRanking();
    }

    const handleBackToWelcomeClick = () => {
        playButtonClickSound();
        onBackToWelcome();
    }

    return (
        <div className="w-full text-center flex flex-col items-center justify-center p-4 bg-black/70 rounded-2xl border-2 border-cyan-400 neon-box animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text">Fim de Jogo!</h1>
            
            <div className="w-full my-6 space-y-4 text-xl">
                <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                    <span className="gold-text">Sua Pontuação:</span>
                    <span className="text-white font-bold">{stats.score}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                    <span className="gold-text">Recorde Pessoal:</span>
                    <span className="text-white font-bold">{player.highScore}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                    <span className="gold-text">Rank do Bairro:</span>
                    <span className="text-white font-bold">{neighborhoodRank ? `${neighborhoodRank}º` : 'N/A'}</span>
                </div>
                 <div className="flex justify-between p-3 bg-gray-900/50 rounded-lg">
                    <span className="gold-text">Maior Combo:</span>
                    <span className="text-white font-bold">x{stats.maxCombo}</span>
                </div>
            </div>

            <div className="space-y-4 w-full max-w-xs mt-4">
                <button onClick={handlePlayAgainClick} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,0,0.8)]">
                    Jogar de Novo
                </button>
                <button onClick={handleRankingClick} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-[0_0_15px_rgba(0,234,255,0.8)]">
                    Ver Ranking dos Bairros
                </button>
                <button onClick={handleBackToWelcomeClick} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105">
                    Menu Principal
                </button>
            </div>
            
            <div className="mt-8 p-2 text-center text-sm text-gray-400">
                <p>"Assista um anúncio para +5 segundos extras"</p>
                <button className="mt-2 px-4 py-2 border-2 border-dashed border-gray-600 rounded">Vídeo Reward Ad</button>
            </div>
        </div>
    );
};

export default ResultScreen;
