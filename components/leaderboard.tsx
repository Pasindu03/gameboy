"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Trophy, User, Star } from "lucide-react"

interface ScoreEntry {
    id: string
    playerName: string
    game: string
    score: number
    date: string
}

export default function LeaderboardPage() {
    const [globalLeaderboard, setGlobalLeaderboard] = useState<ScoreEntry[]>([])
    const [personalBest, setPersonalBest] = useState<ScoreEntry[]>([])
    const [playerName, setPlayerName] = useState<string>("Player")

    useEffect(() => {
        // Load leaderboard data from localStorage
        const savedGlobal = localStorage.getItem("globalLeaderboard")
        const savedPersonal = localStorage.getItem("personalBest")
        const savedPlayerName = localStorage.getItem("playerName")

        if (savedGlobal) {
            setGlobalLeaderboard(JSON.parse(savedGlobal))
        } else {
            // Mock data for demonstration
            const mockGlobal: ScoreEntry[] = [
                { id: "1", playerName: "ARCADE_KING", game: "Tetris", score: 125000, date: "2024-01-15" },
                { id: "2", playerName: "PIXEL_MASTER", game: "Snake", score: 98500, date: "2024-01-14" },
                { id: "3", playerName: "RETRO_GAMER", game: "Pac-Man", score: 87200, date: "2024-01-13" },
                { id: "4", playerName: "SPACE_ACE", game: "Space Invaders", score: 76800, date: "2024-01-12" },
                { id: "5", playerName: "ASTEROID_PRO", game: "Asteroids", score: 65400, date: "2024-01-11" },
                { id: "6", playerName: "PONG_LEGEND", game: "Pong", score: 21, date: "2024-01-10" },
            ]
            setGlobalLeaderboard(mockGlobal)
            localStorage.setItem("globalLeaderboard", JSON.stringify(mockGlobal))
        }

        if (savedPersonal) {
            setPersonalBest(JSON.parse(savedPersonal))
        } else {
            // Mock personal data
            const mockPersonal: ScoreEntry[] = [
                { id: "p1", playerName: "You", game: "Tetris", score: 45000, date: "2024-01-15" },
                { id: "p2", playerName: "You", game: "Snake", score: 32100, date: "2024-01-14" },
                { id: "p3", playerName: "You", game: "Pac-Man", score: 28500, date: "2024-01-13" },
            ]
            setPersonalBest(mockPersonal)
            localStorage.setItem("personalBest", JSON.stringify(mockPersonal))
        }

        if (savedPlayerName) {
            setPlayerName(savedPlayerName)
        }
    }, [])

    const getGameColor = (game: string) => {
        const colors: { [key: string]: string } = {
            Tetris: "text-[#00ffff]",
            Snake: "text-[#00ff00]",
            "Pac-Man": "text-[#ffff00]",
            "Space Invaders": "text-[#ff00ff]",
            Asteroids: "text-[#ff8000]",
            Pong: "text-[#0080ff]",
        }
        return colors[game] || "text-white"
    }

    return (
        <div className="min-h-screen bg-black font-mono text-white relative overflow-hidden">
            {/* Scanlines effect */}
            <div className="scanlines absolute inset-0 pointer-events-none opacity-20"></div>

            {/* Header */}
            <div className="relative z-10 p-4 border-b border-[#00ffff]/30">
                <div className="flex items-center justify-between max-w-6xl mx-auto">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[#00ffff] hover:text-white transition-colors arcade-flash"
                    >
                        <ArrowLeft size={20} />
                        <span>HOME</span>
                    </Link>
                    <h1 className="text-2xl md:text-4xl font-bold text-[#00ffff] neon-glow pixel-bounce">LEADERBOARDS</h1>
                    <div className="w-20"></div>
                </div>
            </div>

            <div className="relative z-10 p-4 max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Global Leaderboard */}
                    <div className="bg-card/50 backdrop-blur-sm border border-[#00ffff]/30 rounded-lg p-6 retro-border">
                        <div className="flex items-center gap-3 mb-6">
                            <Trophy className="text-[#ffff00] neon-glow" size={24} />
                            <h2 className="text-xl font-bold text-[#ffff00] neon-glow">GLOBAL HIGH SCORES</h2>
                        </div>

                        <div className="space-y-3">
                            {globalLeaderboard.map((entry, index) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center justify-between p-3 bg-black/50 border border-border/30 rounded"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[#00ffff] font-bold w-6">#{index + 1}</span>
                                        <div>
                                            <div className="text-white font-bold">{entry.playerName}</div>
                                            <div className={`text-sm ${getGameColor(entry.game)}`}>{entry.game}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[#00ff00] font-bold">{entry.score.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400">{entry.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Personal Best */}
                    <div className="bg-card/50 backdrop-blur-sm border border-[#ff00ff]/30 rounded-lg p-6 retro-border">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="text-[#ff00ff] neon-glow" size={24} />
                            <h2 className="text-xl font-bold text-[#ff00ff] neon-glow">YOUR PERSONAL BEST</h2>
                        </div>

                        <div className="space-y-3">
                            {personalBest.length > 0 ? (
                                personalBest.map((entry, index) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center justify-between p-3 bg-black/50 border border-border/30 rounded"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Star className="text-[#ff00ff]" size={16} />
                                            <div>
                                                <div className={`font-bold ${getGameColor(entry.game)}`}>{entry.game}</div>
                                                <div className="text-xs text-gray-400">{entry.date}</div>
                                            </div>
                                        </div>
                                        <div className="text-[#00ff00] font-bold">{entry.score.toLocaleString()}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="text-4xl mb-2">🎮</div>
                                    <div>No scores yet!</div>
                                    <div className="text-sm">Start playing to see your best scores here</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-card/30 backdrop-blur-sm border border-border/20 rounded-lg p-4">
                    <h3 className="text-[#00ffff] font-bold mb-2 neon-glow">HOW IT WORKS</h3>
                    <div className="text-sm text-gray-300 space-y-1">
                        <div>• Global leaderboard shows the highest scores from all players</div>
                        <div>• Personal best tracks your highest score in each game</div>
                        <div>• Scores are automatically saved when you play</div>
                        <div>• Challenge yourself to climb the rankings!</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
