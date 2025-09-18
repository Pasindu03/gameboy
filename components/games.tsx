"use client"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import Navbar from "@/components/navbar";

const games = [
    {
        id: "tetris",
        name: "TETRIS",
        description: "The classic block-stacking puzzle game",
        icon: "🟦",
        color: "text-[#00ffff]",
        bgColor: "bg-[#00ffff]/10",
        borderColor: "border-[#00ffff]",
        difficulty: "Medium",
        players: "1 Player",
        year: "1984",
    },
    {
        id: "snake",
        name: "SNAKE",
        description: "Eat, grow, and avoid your tail",
        icon: "🐍",
        color: "text-[#00ff00]",
        bgColor: "bg-[#00ff00]/10",
        borderColor: "border-[#00ff00]",
        difficulty: "Easy",
        players: "1 Player",
        year: "1976",
    },
    {
        id: "pacman",
        name: "PAC-MAN",
        description: "Chomp dots and avoid the ghosts",
        icon: "🟡",
        color: "text-[#ffff00]",
        bgColor: "bg-[#ffff00]/10",
        borderColor: "border-[#ffff00]",
        difficulty: "Medium",
        players: "1-2 Players",
        year: "1980",
    },
    {
        id: "invaders",
        name: "SPACE INVADERS",
        description: "Defend Earth from alien invasion",
        icon: "👾",
        color: "text-[#ff00ff]",
        bgColor: "bg-[#ff00ff]/10",
        borderColor: "border-[#ff00ff]",
        difficulty: "Hard",
        players: "1-2 Players",
        year: "1978",
    },
    {
        id: "asteroids",
        name: "ASTEROIDS",
        description: "Navigate space and destroy asteroids",
        icon: "🚀",
        color: "text-[#ff8000]",
        bgColor: "bg-[#ff8000]/10",
        borderColor: "border-[#ff8000]",
        difficulty: "Hard",
        players: "1 Player",
        year: "1979",
    },
    {
        id: "pong",
        name: "PONG",
        description: "The original arcade tennis game",
        icon: "🏓",
        color: "text-[#0080ff]",
        bgColor: "bg-[#0080ff]/10",
        borderColor: "border-[#0080ff]",
        difficulty: "Easy",
        players: "1-2 Players",
        year: "1972",
    },
]

const Games = () => {
    return (
        <div>
            <Navbar />
            {/* Games Grid */}
            <section id="games" className="relative z-10 py-20 px-4">
                <div className="container mx-auto">
                    <h2 className="text-4xl md:text-6xl font-mono font-bold text-center mb-4 neon-glow text-accent">
                        SELECT GAME
                    </h2>
                    <p className="text-center font-mono text-muted-foreground mb-12">{"> CHOOSE YOUR ADVENTURE <"}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {games.map((game) => (
                            <Card
                                key={game.id}
                                className={`group cursor-pointer transition-all duration-300 hover:scale-105 bg-card/50 border-2 ${game.borderColor} backdrop-blur-sm hover:shadow-lg hover:shadow-current/20`}
                            >
                                <CardHeader className="text-center">
                                    <div
                                        className={`text-6xl mb-4 group-hover:scale-110 transition-transform ${game.bgColor} w-20 h-20 rounded-lg flex items-center justify-center mx-auto`}
                                    >
                                        {game.icon}
                                    </div>
                                    <CardTitle className={`font-mono text-xl ${game.color} group-hover:neon-glow`}>{game.name}</CardTitle>
                                    <CardDescription className="font-mono text-sm">{game.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                                        <span>YEAR: {game.year}</span>
                                        <span>{game.players}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <Badge variant="outline" className="font-mono text-xs">
                                            {game.difficulty}
                                        </Badge>
                                        <Link href={`/games/${game.id}`} >
                                            <Button
                                                size="sm"
                                                className={`font-mono ${game.color} bg-transparent border-current hover:bg-gray-800 hover:text-background`}
                                            >
                                                PLAY
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Games;