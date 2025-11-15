
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats } from '../types';
import { useAppContext } from '../App';

interface GameObject {
    id: number;
    x: number;
    y: number;
    size: number;
    vx: number;
    vy: number;
    color: string;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
}

const GAME_DURATION = 60; // seconds

const GameScreen: React.FC<{ onGameEnd: (stats: GameStats) => void }> = ({ onGameEnd }) => {
    const { playPopSound } = useAppContext();
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const lastPopTimeRef = useRef<number>(0);
    const animationFrameId = useRef<number>(0);
    const spawnIntervalId = useRef<number | undefined>(undefined);

    const onGameEndRef = useRef(onGameEnd);
    onGameEndRef.current = onGameEnd;
    const scoreRef = useRef(score);
    scoreRef.current = score;
    const maxComboRef = useRef(maxCombo);
    maxComboRef.current = maxCombo;

    const elapsedTime = GAME_DURATION - timeLeft;
    const difficulty = Math.floor(elapsedTime / 20) + 1;
    const isFrenzy = timeLeft <= 10;
    
    const spawnGameObject = useCallback(() => {
        if (!gameAreaRef.current) return;
        const { width, height } = gameAreaRef.current.getBoundingClientRect();
        if (height === 0) return; // Don't spawn if game area is not rendered
        const size = Math.random() * 30 + 20;
        const colors = ['#ff0000', '#f2c94c', '#00eaff'];

        setGameObjects(prev => [
            ...prev,
            {
                id: Date.now() + Math.random(),
                x: Math.random() * (width - size),
                y: height,
                size,
                vx: (Math.random() - 0.5) * 3 * difficulty,
                vy: -(Math.random() * 2 + 1.5) * difficulty,
                color: colors[Math.floor(Math.random() * colors.length)],
            },
        ]);
    }, [difficulty]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    if (spawnIntervalId.current) clearInterval(spawnIntervalId.current);
                    onGameEndRef.current({ score: scoreRef.current, maxCombo: maxComboRef.current });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        spawnIntervalId.current = window.setInterval(spawnGameObject, Math.max(100, 1000 / difficulty));

        return () => {
            clearInterval(timer);
            if (spawnIntervalId.current) clearInterval(spawnIntervalId.current);
            cancelAnimationFrame(animationFrameId.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        if (spawnIntervalId.current) clearInterval(spawnIntervalId.current);
        spawnIntervalId.current = window.setInterval(spawnGameObject, Math.max(100, 1000 / (difficulty * (isFrenzy ? 2 : 1))));
    }, [difficulty, isFrenzy, spawnGameObject]);

    const gameLoop = useCallback(() => {
        const { current: gameArea } = gameAreaRef;
        if (!gameArea) return;
        const { width, height } = gameArea.getBoundingClientRect();

        setGameObjects(prev =>
            prev.map(obj => ({
                ...obj,
                x: obj.x + obj.vx,
                y: obj.y + obj.vy,
            })).filter(obj => obj.y > -obj.size && obj.y < height + obj.size && obj.x > -obj.size && obj.x < width + obj.size)
        );

        setParticles(prev => 
            prev.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                life: p.life - 1,
                size: Math.max(0, p.size * 0.95),
            })).filter(p => p.life > 0)
        );

        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, []);

    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return () => cancelAnimationFrame(animationFrameId.current);
    }, [gameLoop]);

    const createParticles = (x: number, y: number, color: string) => {
        const newParticles: Particle[] = Array.from({ length: 20 }).map(() => ({
            id: Math.random(),
            x,
            y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            size: Math.random() * 5 + 2,
            color,
            life: 30,
        }));
        setParticles(prev => [...prev, ...newParticles]);
    };

    const handleObjectClick = (id: number) => {
        const obj = gameObjects.find(o => o.id === id);
        if (!obj) return;

        playPopSound();
        createParticles(obj.x + obj.size / 2, obj.y + obj.size / 2, obj.color);

        const now = Date.now();
        const newCombo = (now - lastPopTimeRef.current < 1500) ? combo + 1 : 1;
        lastPopTimeRef.current = now;

        setCombo(newCombo);
        setMaxCombo(prev => Math.max(prev, newCombo));
        setScore(prev => prev + (10 * newCombo));
        setGameObjects(prev => prev.filter(o => o.id !== id));
    };

    return (
        <div className={`relative w-full h-screen flex flex-col items-center justify-between ${isFrenzy ? 'frenzy-overlay' : ''}`}>
             <div className="absolute top-4 right-4 p-4 bg-black/50 z-20 flex flex-col items-end neon-box rounded-lg">
                <div className="flex items-center">
                    <span className="text-lg md:text-xl gold-text">SCORE:</span>
                    <span className="ml-2 text-xl md:text-2xl text-white font-bold w-24 text-right">{score}</span>
                </div>
                <div className="flex items-center mt-2">
                    <span className="text-lg md:text-xl gold-text">TEMPO:</span>
                    <span className={`ml-2 text-xl md:text-2xl font-bold w-24 text-right ${isFrenzy ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}</span>
                </div>
                {combo > 1 && <div className="mt-2 text-lg md:text-xl font-bold text-red-500 animate-ping-once">COMBO x{combo}</div>}
            </div>

            <div ref={gameAreaRef} className="absolute top-0 left-0 w-full h-full overflow-hidden z-10">
                {gameObjects.map(obj => (
                    <div
                        key={obj.id}
                        className="absolute rounded-full cursor-pointer"
                        style={{
                            left: obj.x,
                            top: obj.y,
                            width: obj.size,
                            height: obj.size,
                            background: `radial-gradient(circle, ${obj.color} 50%, transparent 100%)`,
                            boxShadow: `0 0 15px ${obj.color}`,
                            transform: 'translateZ(0)',
                        }}
                        onClick={() => handleObjectClick(obj.id)}
                    />
                ))}
                 {particles.map(p => (
                    <div
                        key={p.id}
                        className="absolute rounded-full"
                        style={{
                            left: p.x,
                            top: p.y,
                            width: p.size,
                            height: p.size,
                            background: p.color,
                            boxShadow: `0 0 10px ${p.color}`,
                        }}
                    />
                ))}
            </div>
            
            {isFrenzy && <div className="absolute inset-0 text-6xl md:text-8xl text-red-600 font-black flex items-center justify-center opacity-20 pointer-events-none z-0 animate-pulse">ACABANDO!</div>}
        </div>
    );
};

export default GameScreen;
