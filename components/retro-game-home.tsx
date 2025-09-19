"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gamepad2, Zap, Trophy, Users, Play} from "lucide-react"
import Link from "next/link"
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
    id: "space",
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
    id: "asteroid",
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

const stats = [
  { icon: Gamepad2, label: "Games Available", value: "6+" },
  { icon: Users, label: "Players Online", value: "1,337" },
  { icon: Trophy, label: "High Scores", value: "∞" },
  { icon: Zap, label: "Arcade Power", value: "9000%" },
]

export default function RetroGameHome() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Scanlines effect */}
      <div className="scanlines absolute inset-0 z-0" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-mono font-black mb-4 neon-glow text-primary pixel-bounce">
              GAME ON!
            </h1>
            <p className="text-xl md:text-2xl font-mono text-muted-foreground mb-8">
              {"> WELCOME TO THE ULTIMATE RETRO ARCADE EXPERIENCE <"}
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="font-mono text-sm px-4 py-2">
                EST. 1972
              </Badge>
              <Badge variant="outline" className="font-mono text-sm px-4 py-2 border-accent text-accent">
                100% AUTHENTIC
              </Badge>
              <Badge variant="outline" className="font-mono text-sm px-4 py-2 border-primary text-primary">
                PIXEL PERFECT
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-card/50 border-border/50 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <stat.icon className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <div className="font-mono text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="font-mono text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button size="lg" className="font-mono text-lg px-8 py-4 bg-primary hover:bg-primary/90 arcade-flash">
            <Play className="mr-2 h-5 w-5" />
            START PLAYING
          </Button>
        </div>
      </section>

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

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4 bg-card/20">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-6xl font-mono font-bold text-center mb-12 neon-glow text-secondary">
            ARCADE FEATURES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🕹️</div>
              <h3 className="font-mono text-xl font-bold mb-2 text-accent">AUTHENTIC CONTROLS</h3>
              <p className="font-mono text-sm text-muted-foreground">
                Experience the original arcade controls with keyboard and touch support
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-mono text-xl font-bold mb-2 text-accent">HIGH SCORES</h3>
              <p className="font-mono text-sm text-muted-foreground">
                Compete for the top spot on our global leaderboards
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="font-mono text-xl font-bold mb-2 text-accent">CROSS-PLATFORM</h3>
              <p className="font-mono text-sm text-muted-foreground">Play on any device - desktop, tablet, or mobile</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/50 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="font-mono text-2xl font-bold mb-4 neon-glow text-primary">{"◤ RETRO ARCADE ◥"}</div>
          <p className="font-mono text-sm text-muted-foreground mb-4">{"> GAME OVER? INSERT COIN TO CONTINUE <"}</p>
          <div className="flex justify-center gap-4 text-xs font-mono text-muted-foreground">
            <span>© 2024 RETRO ARCADE</span>
            <span>•</span>
            <span>MADE WITH ❤️ FOR GAMERS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
