"use client"

import Link from "next/link"
import { ArrowLeft, Gamepad2, Code, Heart, Zap, Users, Trophy } from "lucide-react"

export default function AboutPage() {
    const games = [
        { name: "Tetris", year: "1984", creator: "Alexey Pajitnov", color: "text-[#00ffff]" },
        { name: "Snake", year: "1976", creator: "Gremlin Industries", color: "text-[#00ff00]" },
        { name: "Pac-Man", year: "1980", creator: "Namco", color: "text-[#ffff00]" },
        { name: "Space Invaders", year: "1978", creator: "Taito", color: "text-[#ff00ff]" },
        { name: "Asteroids", year: "1979", creator: "Atari", color: "text-[#ff8000]" },
        { name: "Pong", year: "1972", creator: "Atari", color: "text-[#0080ff]" },
    ]

    const features = [
        { icon: Gamepad2, title: "Classic Gameplay", desc: "Authentic retro gaming experience" },
        { icon: Code, title: "Modern Tech", desc: "Built with Next.js and React" },
        { icon: Heart, title: "Pixel Perfect", desc: "Carefully crafted retro aesthetics" },
        { icon: Zap, title: "Responsive", desc: "Works on desktop and mobile" },
        { icon: Users, title: "Multiplayer", desc: "Some games support 2 players" },
        { icon: Trophy, title: "Leaderboards", desc: "Track your high scores" },
    ]

    return (
        <div className="min-h-screen bg-black font-mono text-white relative overflow-hidden">
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
                    <h1 className="text-2xl md:text-4xl font-bold text-[#00ffff] neon-glow pixel-bounce">ABOUT US</h1>
                    <div className="w-20"></div>
                </div>
            </div>

            <div className="relative z-10 p-4 max-w-6xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="text-center py-8">
                    <div className="text-6xl mb-4 neon-glow">🕹️</div>
                    <h2 className="text-3xl md:text-5xl font-bold text-[#ffff00] neon-glow mb-4">RETRO ARCADE COLLECTION</h2>
                    <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                        Welcome to the ultimate collection of classic arcade games! We've recreated the most iconic games from the
                        golden age of arcade gaming, bringing you authentic retro experiences with modern web technology.
                    </p>
                </div>

                {/* Mission */}
                <div className="bg-card/50 backdrop-blur-sm border border-[#ff00ff]/30 rounded-lg p-6 retro-border">
                    <h3 className="text-2xl font-bold text-[#ff00ff] neon-glow mb-4">OUR MISSION</h3>
                    <p className="text-gray-300 leading-relaxed">
                        To preserve and celebrate the golden age of arcade gaming by creating pixel-perfect recreations of classic
                        games. We believe these timeless games deserve to be experienced by new generations while maintaining their
                        original charm and challenge.
                    </p>
                </div>

                {/* Games Collection */}
                <div className="bg-card/50 backdrop-blur-sm border border-[#00ff00]/30 rounded-lg p-6 retro-border">
                    <h3 className="text-2xl font-bold text-[#00ff00] neon-glow mb-6">CLASSIC GAMES COLLECTION</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {games.map((game) => (
                            <div key={game.name} className="bg-black/50 border border-border/30 rounded p-4">
                                <div className={`font-bold text-lg ${game.color} neon-glow`}>{game.name}</div>
                                <div className="text-sm text-gray-400">Released: {game.year}</div>
                                <div className="text-sm text-gray-400">By: {game.creator}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="bg-card/50 backdrop-blur-sm border border-[#ff8000]/30 rounded-lg p-6 retro-border">
                    <h3 className="text-2xl font-bold text-[#ff8000] neon-glow mb-6">FEATURES</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div key={feature.title} className="flex items-start gap-3">
                                <feature.icon className="text-[#ff8000] neon-glow mt-1" size={20} />
                                <div>
                                    <div className="font-bold text-white">{feature.title}</div>
                                    <div className="text-sm text-gray-400">{feature.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technology */}
                <div className="bg-card/50 backdrop-blur-sm border border-[#0080ff]/30 rounded-lg p-6 retro-border">
                    <h3 className="text-2xl font-bold text-[#0080ff] neon-glow mb-4">TECHNOLOGY</h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                        Built with modern web technologies while maintaining authentic retro aesthetics:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-[#0080ff] font-bold">Frontend:</div>
                            <div className="text-gray-300">Next.js 14, React, TypeScript</div>
                        </div>
                        <div>
                            <div className="text-[#0080ff] font-bold">Styling:</div>
                            <div className="text-gray-300">Tailwind CSS, Custom CSS Animations</div>
                        </div>
                        <div>
                            <div className="text-[#0080ff] font-bold">Game Logic:</div>
                            <div className="text-gray-300">Canvas API, RequestAnimationFrame</div>
                        </div>
                        <div>
                            <div className="text-[#0080ff] font-bold">Storage:</div>
                            <div className="text-gray-300">LocalStorage for scores and settings</div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center py-8">
                    <h3 className="text-2xl font-bold text-[#ffff00] neon-glow mb-4">READY TO PLAY?</h3>
                    <p className="text-gray-300 mb-6">Experience the nostalgia and challenge of classic arcade gaming!</p>
                    <Link
                        href="/"
                        className="inline-block bg-[#ffff00] text-black px-8 py-3 rounded font-bold hover:bg-white transition-colors arcade-flash"
                    >
                        START GAMING
                    </Link>
                </div>
            </div>
        </div>
    )
}
