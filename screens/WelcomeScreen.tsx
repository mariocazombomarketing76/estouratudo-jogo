
import React, { useState } from 'react';
import { Player } from '../types';
import { useAppContext } from '../App';

interface WelcomeScreenProps {
    player: Player | null;
    onLogin: (name: string, neighborhood: string, whatsapp: string) => void;
    onPlay: () => void;
    onShowRanking: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ player, onLogin, onPlay, onShowRanking }) => {
    const [name, setName] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const { playButtonClickSound, playTypingSound } = useAppContext();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        playButtonClickSound();
        if (name.trim() && neighborhood.trim()) {
            onLogin(name, neighborhood, whatsapp);
        }
    };

    const handlePlayClick = () => {
        playButtonClickSound();
        onPlay();
    };

    const handleRankingClick = () => {
        playButtonClickSound();
        onShowRanking();
    };

    return (
        <div className="w-full h-full text-center flex flex-col items-center justify-around animate-fade-in">
            <div>
                <img src="http://golitoresultados.com/wp-content/uploads/2025/11/EstouraTudo.png" alt="EstouraTudo Logo" className="w-64 md:w-80 mb-8 mx-auto" />
                <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text tracking-widest">ESTOURATUDO</h1>
                <p className="text-lg text-cyan-300 mb-8">O Jogo do Bairro</p>
            </div>

            {player ? (
                <div className="space-y-4 w-full max-w-xs">
                    <h2 className="text-2xl gold-text">Bem-vindo, {player.name}!</h2>
                    <p className="text-gray-300">Bairro: {player.neighborhood}</p>
                    <button onClick={handlePlayClick} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,0,0.8)]">
                        Jogar Agora
                    </button>
                    <button onClick={handleRankingClick} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-[0_0_15px_rgba(0,234,255,0.8)]">
                        Ranking dos Bairros
                    </button>
                </div>
            ) : (
                <form onSubmit={handleLogin} className="space-y-4 w-full max-w-xs">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={playTypingSound}
                        placeholder="Seu Nome"
                        className="w-full p-3 bg-gray-800 border-2 border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 neon-box"
                        required
                    />
                    <input
                        type="text"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        onKeyDown={playTypingSound}
                        placeholder="Seu Bairro (ex: Maianga, Luanda)"
                        className="w-full p-3 bg-gray-800 border-2 border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 neon-box"
                        required
                    />
                     <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        onKeyDown={playTypingSound}
                        placeholder="Seu WhatsApp (Opcional)"
                        className="w-full p-3 bg-gray-800 border-2 border-cyan-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 neon-box"
                    />
                    <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg text-xl transition-transform transform hover:scale-105 shadow-[0_0_15px_rgba(255,0,0,0.8)]">
                        Jogar Agora
                    </button>
                </form>
            )}
            <div className="p-2 text-center text-sm text-gray-400">
                <p>Reserve este espaço para um banner de anúncio</p>
                <div className="h-12 w-full max-w-sm mx-auto border-2 border-dashed border-gray-600 rounded mt-1 flex items-center justify-center">Banner Ad</div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
