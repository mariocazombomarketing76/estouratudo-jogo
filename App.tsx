
import React, { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { Player, Screen, GameStats, NeighborhoodStats } from './types';
import { StorageService } from './services/storageService';
import WelcomeScreen from './screens/WelcomeScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';
import RankingScreen from './screens/RankingScreen';

interface AppContextType {
  player: Player | null;
  setPlayer: (player: Player | null) => void;
  playPopSound: () => void;
  playButtonClickSound: () => void;
  playTypingSound: () => void;
  setCurrentScreen: (screen: Screen) => void;
}

const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

const BackgroundParticles: React.FC = () => (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-full h-full bg-gradient-to-b from-black via-gray-900 to-black opacity-80"></div>
        {Array.from({ length: 50 }).map((_, i) => (
            <div
                key={i}
                className="absolute rounded-full bg-cyan-400/20"
                style={{
                    width: `${Math.random() * 3}px`,
                    height: `${Math.random() * 3}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `twinkle ${Math.random() * 5 + 3}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                }}
            ></div>
        ))}
        <style>{`
            @keyframes twinkle {
                0%, 100% { opacity: 0; transform: scale(0.5); }
                50% { opacity: 1; transform: scale(1); }
            }
        `}</style>
    </div>
);


const App: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.Welcome);
    const [player, setPlayer] = useState<Player | null>(null);
    const [lastGameStats, setLastGameStats] = useState<GameStats | null>(null);
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const musicSourceRef = useRef<{ oscillator: OscillatorNode; gain: GainNode; intervalId?: number } | null>(null);

    useEffect(() => {
        const storedPlayer = StorageService.getPlayer();
        if (storedPlayer) {
            setPlayer(storedPlayer);
        }
    }, []);
    
    const initAudioContext = () => {
        if (audioContext) {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            return audioContext;
        }

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
            console.warn("Web Audio API is not supported by this browser.");
            return null;
        }

        try {
            const context = new AudioContextClass();
            setAudioContext(context);
            return context;
        } catch (e) {
            console.error("Could not create AudioContext:", e);
            return null;
        }
    };
    
    const playMusic = useCallback((type: 'welcome' | 'game' | 'result' | 'ranking') => {
        const ctx = initAudioContext();
        if (!ctx) return;
    
        // Stop previous music
        if (musicSourceRef.current) {
            if (musicSourceRef.current.intervalId) {
                clearInterval(musicSourceRef.current.intervalId);
            }
            musicSourceRef.current.gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
            musicSourceRef.current.oscillator.stop(ctx.currentTime + 0.5);
            musicSourceRef.current = null;
        }
    
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        oscillator.connect(gainNode);
        oscillator.type = 'sine';
    
        let intervalId: number | undefined = undefined;
    
        if (type === 'welcome' || type === 'ranking') {
            const notes = [261.63, 329.63, 392.00]; // C4, E4, G4
            const tempo = 500;
            gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
            let noteIndex = 0;
            intervalId = window.setInterval(() => {
                if (ctx.state === 'running') {
                    oscillator.frequency.setValueAtTime(notes[noteIndex], ctx.currentTime);
                    noteIndex = (noteIndex + 1) % notes.length;
                }
            }, tempo);
        } else if (type === 'game') {
            const notes = [392.00, 440.00, 523.25, 440.00]; // G4, A4, C5, A4
            const tempo = 250;
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            let noteIndex = 0;
            intervalId = window.setInterval(() => {
                 if (ctx.state === 'running') {
                    oscillator.frequency.setValueAtTime(notes[noteIndex], ctx.currentTime);
                    noteIndex = (noteIndex + 1) % notes.length;
                }
            }, tempo);
        } else { // result
            const notes = [523.25, 392.00, 329.63, 261.63];
            const duration = 0.15;
            gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
            notes.forEach((freq, i) => {
                oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * duration);
            });
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + notes.length * duration);
            oscillator.stop(ctx.currentTime + notes.length * duration);
        }
        
        oscillator.start();
        
        if (type === 'welcome' || type === 'game' || type === 'ranking') {
             musicSourceRef.current = { 
                oscillator: oscillator, 
                gain: gainNode, 
                intervalId: intervalId,
            };
        }
    }, [audioContext]);

    useEffect(() => {
        let musicType: 'welcome' | 'game' | 'result' | 'ranking';
        
        switch(currentScreen) {
            case Screen.Game:
                musicType = 'game';
                break;
            case Screen.Result:
                musicType = 'result';
                break;
            case Screen.Ranking:
                 musicType = 'ranking';
                 break;
            case Screen.Welcome:
            default:
                musicType = 'welcome';
                break;
        }
        playMusic(musicType);
    }, [currentScreen, playMusic]);

    const playSound = useCallback((type: 'pop' | 'click') => {
        const ctx = initAudioContext();
        if (!ctx) return;
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        gainNode.connect(ctx.destination);
        oscillator.connect(gainNode);

        if (type === 'pop') {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(440, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.2);
        } else if (type === 'click') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
        }
    }, [audioContext]);

    const playTypingSound = useCallback(() => {
        const ctx = initAudioContext();
        if (!ctx) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        gainNode.connect(ctx.destination);
        oscillator.connect(gainNode);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
    }, [audioContext]);

    const handleGameEnd = (stats: GameStats) => {
        if (!player) return;

        const updatedPlayer = StorageService.updatePlayerStats(player.id, stats.score);
        if (updatedPlayer) {
            StorageService.updateNeighborhoodStats(player.neighborhood, stats.score);
            setPlayer(updatedPlayer);
            setLastGameStats(stats);
            setCurrentScreen(Screen.Result);
        } else {
            console.error("Failed to update player stats. Returning to welcome screen.");
            setCurrentScreen(Screen.Welcome);
        }
    };
    
    const handleLogin = (name: string, neighborhood: string, whatsapp: string) => {
        const newPlayer = StorageService.createPlayer(name, neighborhood, whatsapp);
        setPlayer(newPlayer);
    };

    const handlePlayAgain = () => {
        setLastGameStats(null);
        setCurrentScreen(Screen.Game);
    };

    const handleBackToWelcome = () => {
        setLastGameStats(null);
        setCurrentScreen(Screen.Welcome);
    };
    
    const handleShowRanking = () => {
        setCurrentScreen(Screen.Ranking);
    };
    
    const handleBackFromRanking = () => {
        // Go back to result screen if there are stats, otherwise go to welcome
        if (lastGameStats) {
            setCurrentScreen(Screen.Result);
        } else {
            setCurrentScreen(Screen.Welcome);
        }
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case Screen.Game:
                return <GameScreen onGameEnd={handleGameEnd} />;
            case Screen.Result:
                 if (!lastGameStats || !player) {
                    // This should not happen with the new flow, but as a fallback:
                    return null;
                }
                return <ResultScreen 
                            stats={lastGameStats} 
                            player={player} 
                            onPlayAgain={handlePlayAgain} 
                            onShowRanking={handleShowRanking}
                            onBackToWelcome={handleBackToWelcome}
                        />;
            case Screen.Ranking:
                return <RankingScreen onBack={handleBackFromRanking} currentPlayer={player} />;
            case Screen.Welcome:
            default:
                return <WelcomeScreen 
                            player={player} 
                            onLogin={handleLogin} 
                            onPlay={() => setCurrentScreen(Screen.Game)} 
                            onShowRanking={handleShowRanking}
                        />;
        }
    };
    
    const appContextValue: AppContextType = {
        player,
        setPlayer,
        playPopSound: () => playSound('pop'),
        playButtonClickSound: () => playSound('click'),
        playTypingSound,
        setCurrentScreen,
    };
    
    const containerClasses = currentScreen === Screen.Game
        ? "relative z-10 w-full h-full"
        : "relative z-10 w-full h-full max-w-lg mx-auto flex flex-col items-center justify-center p-4";

    return (
        <AppContext.Provider value={appContextValue}>
            <div className="relative min-h-screen w-full bg-black flex items-center justify-center text-white overflow-hidden">
                <BackgroundParticles />
                <div className={containerClasses}>
                    {renderScreen()}
                </div>
                <footer className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500 z-20">
                    Powered by Golo Ao Vivo
                </footer>
            </div>
        </AppContext.Provider>
    );
};

export default App;
