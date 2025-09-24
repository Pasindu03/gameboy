"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Home, Zap } from "lucide-react"
import Link from "next/link"

type Position = { x: number; y: number }
type Bullet = Position & { id: number }
type Invader = Position & { id: number; type: number }

const GAME_WIDTH = 800
const GAME_HEIGHT = 600
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 20
const INVADER_WIDTH = 30
const INVADER_HEIGHT = 20
const BULLET_WIDTH = 4
const BULLET_HEIGHT = 10

const INVADER_ROWS = 5
const INVADER_COLS = 11
const INVADER_SPACING_X = 50
const INVADER_SPACING_Y = 40

export default function SpaceInvadersGame() {
  const [player, setPlayer] = useState<Position>({ x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2, y: GAME_HEIGHT - 60 })
  const [invaders, setInvaders] = useState<Invader[]>([])
  const [playerBullets, setPlayerBullets] = useState<Bullet[]>([])
  const [invaderBullets, setInvaderBullets] = useState<Bullet[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [invaderDirection, setInvaderDirection] = useState(1) // 1 for right, -1 for left
  const [invaderSpeed, setInvaderSpeed] = useState(1)

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const bulletIdRef = useRef(0)
  const keysRef = useRef<Set<string>>(new Set())

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem("space-invaders-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Initialize invaders
  const initializeInvaders = useCallback(() => {
    const newInvaders: Invader[] = []
    let id = 0

    for (let row = 0; row < INVADER_ROWS; row++) {
      for (let col = 0; col < INVADER_COLS; col++) {
        newInvaders.push({
          id: id++,
          x: 100 + col * INVADER_SPACING_X,
          y: 50 + row * INVADER_SPACING_Y,
          type: row < 1 ? 3 : row < 3 ? 2 : 1, // Different types for different rows
        })
      }
    }

    setInvaders(newInvaders)
  }, [])

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault()
        if (isPlaying && !isPaused && !gameOver) {
          shoot()
        } else if (gameOver) {
          startGame()
        } else if (!isPlaying) {
          startGame()
        }
      } else if (e.key.toLowerCase() === "p") {
        e.preventDefault()
        togglePause()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isPlaying, isPaused, gameOver])

  // Player movement
  const updatePlayer = useCallback(() => {
    if (!isPlaying || isPaused || gameOver) return

    setPlayer((prev) => {
      let newX = prev.x

      if (keysRef.current.has("arrowleft") || keysRef.current.has("a")) {
        newX = Math.max(0, prev.x - 5)
      }
      if (keysRef.current.has("arrowright") || keysRef.current.has("d")) {
        newX = Math.min(GAME_WIDTH - PLAYER_WIDTH, prev.x + 5)
      }

      return { ...prev, x: newX }
    })
  }, [isPlaying, isPaused, gameOver])

  // Shoot bullet
  const shoot = useCallback(() => {
    if (!isPlaying || isPaused || gameOver) return

    setPlayerBullets((prev) => [
      ...prev,
      {
        id: bulletIdRef.current++,
        x: player.x + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2,
        y: player.y,
      },
    ])
  }, [player, isPlaying, isPaused, gameOver])

  // Update bullets
  const updateBullets = useCallback(() => {
    // Update player bullets
    setPlayerBullets((prev) =>
      prev.map((bullet) => ({ ...bullet, y: bullet.y - 8 })).filter((bullet) => bullet.y > -BULLET_HEIGHT),
    )

    // Update invader bullets
    setInvaderBullets((prev) =>
      prev.map((bullet) => ({ ...bullet, y: bullet.y + 4 })).filter((bullet) => bullet.y < GAME_HEIGHT + BULLET_HEIGHT),
    )

    // Random invader shooting
    if (Math.random() < 0.02 && invaders.length > 0) {
      const shootingInvader = invaders[Math.floor(Math.random() * invaders.length)]
      setInvaderBullets((prev) => [
        ...prev,
        {
          id: bulletIdRef.current++,
          x: shootingInvader.x + INVADER_WIDTH / 2 - BULLET_WIDTH / 2,
          y: shootingInvader.y + INVADER_HEIGHT,
        },
      ])
    }
  }, [invaders])

  // Update invaders
  const updateInvaders = useCallback(() => {
    if (invaders.length === 0) return

    setInvaders((prev) => {
      let shouldMoveDown = false
      const newInvaders = prev.map((invader) => {
        const newX = invader.x + invaderDirection * invaderSpeed

        if (newX <= 0 || newX >= GAME_WIDTH - INVADER_WIDTH) {
          shouldMoveDown = true
        }

        return { ...invader, x: newX }
      })

      if (shouldMoveDown) {
        setInvaderDirection((prev) => -prev)
        return newInvaders.map((invader) => ({ ...invader, y: invader.y + 20 }))
      }

      return newInvaders
    })
  }, [invaders, invaderDirection, invaderSpeed])

  // Collision detection
  const checkCollisions = useCallback(() => {
    // Player bullets vs invaders
    setPlayerBullets((prevBullets) => {
      const remainingBullets = [...prevBullets]

      setInvaders((prevInvaders) => {
        const remainingInvaders = [...prevInvaders]

        prevBullets.forEach((bullet) => {
          const hitInvaderIndex = remainingInvaders.findIndex(
            (invader) =>
              bullet.x < invader.x + INVADER_WIDTH &&
              bullet.x + BULLET_WIDTH > invader.x &&
              bullet.y < invader.y + INVADER_HEIGHT &&
              bullet.y + BULLET_HEIGHT > invader.y,
          )

          if (hitInvaderIndex !== -1) {
            const hitInvader = remainingInvaders[hitInvaderIndex]
            const points = hitInvader.type * 10

            setScore((prev) => {
              const newScore = prev + points
              if (newScore > highScore) {
                setHighScore(newScore)
                localStorage.setItem("space-invaders-high-score", newScore.toString())
              }
              return newScore
            })

            remainingInvaders.splice(hitInvaderIndex, 1)
            const bulletIndex = remainingBullets.findIndex((b) => b.id === bullet.id)
            if (bulletIndex !== -1) {
              remainingBullets.splice(bulletIndex, 1)
            }
          }
        })

        // Check if all invaders destroyed
        if (remainingInvaders.length === 0) {
          setLevel((prev) => prev + 1)
          setInvaderSpeed((prev) => prev + 0.5)
          setTimeout(() => {
            initializeInvaders()
          }, 1000)
        }

        return remainingInvaders
      })

      return remainingBullets
    })

    // Invader bullets vs player
    const playerHit = invaderBullets.some(
      (bullet) =>
        bullet.x < player.x + PLAYER_WIDTH &&
        bullet.x + BULLET_WIDTH > player.x &&
        bullet.y < player.y + PLAYER_HEIGHT &&
        bullet.y + BULLET_HEIGHT > player.y,
    )

    if (playerHit) {
      setLives((prev) => {
        const newLives = prev - 1
        if (newLives <= 0) {
          setGameOver(true)
          setIsPlaying(false)
        }
        return newLives
      })
      setInvaderBullets([]) // Clear bullets after hit
    }

    // Check if invaders reached bottom
    const invaderReachedBottom = invaders.some((invader) => invader.y + INVADER_HEIGHT >= player.y)
    if (invaderReachedBottom) {
      setGameOver(true)
      setIsPlaying(false)
    }
  }, [playerBullets, invaderBullets, invaders, player, highScore, initializeInvaders])

  // Game loop
  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        updatePlayer()
        updateBullets()
        updateInvaders()
        checkCollisions()
      }, 16) // ~60 FPS
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [isPlaying, isPaused, gameOver, updatePlayer, updateBullets, updateInvaders, checkCollisions])

  const startGame = () => {
    setPlayer({ x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2, y: GAME_HEIGHT - 60 })
    initializeInvaders()
    setPlayerBullets([])
    setInvaderBullets([])
    setScore(0)
    setLives(3)
    setLevel(1)
    setGameOver(false)
    setIsPlaying(true)
    setIsPaused(false)
    setInvaderDirection(1)
    setInvaderSpeed(1)
    bulletIdRef.current = 0
  }

  const togglePause = () => {
    if (isPlaying && !gameOver) {
      setIsPaused(!isPaused)
    }
  }

  const resetGame = () => {
    setIsPlaying(false)
    setIsPaused(false)
    setGameOver(false)
    setPlayerBullets([])
    setInvaderBullets([])
    setInvaders([])
    setScore(0)
    setLives(3)
    setLevel(1)
    setInvaderDirection(1)
    setInvaderSpeed(1)
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/games">
            <Button
              variant="outline"
              size="sm"
              className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black bg-transparent"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-center text-green-400 animate-pulse">SPACE INVADERS</h1>
          <div className="w-20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-green-400 p-4">
              <div
                className="relative bg-black border-2 border-green-400 mx-auto overflow-hidden"
                style={{
                  width: `${GAME_WIDTH}px`,
                  height: `${GAME_HEIGHT}px`,
                  maxWidth: "100%",
                }}
              >
                {/* Stars background */}
                <div className="absolute inset-0">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white opacity-60"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>

                {/* Player */}
                <div
                  className="absolute bg-green-400"
                  style={{
                    left: `${player.x}px`,
                    top: `${player.y}px`,
                    width: `${PLAYER_WIDTH}px`,
                    height: `${PLAYER_HEIGHT}px`,
                    clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                  }}
                />

                {/* Invaders */}
                {invaders.map((invader) => (
                  <div
                    key={invader.id}
                    className={`absolute ${
                      invader.type === 3 ? "bg-red-400" : invader.type === 2 ? "bg-yellow-400" : "bg-cyan-400"
                    }`}
                    style={{
                      left: `${invader.x}px`,
                      top: `${invader.y}px`,
                      width: `${INVADER_WIDTH}px`,
                      height: `${INVADER_HEIGHT}px`,
                    }}
                  />
                ))}

                {/* Player Bullets */}
                {playerBullets.map((bullet) => (
                  <div
                    key={bullet.id}
                    className="absolute bg-green-300"
                    style={{
                      left: `${bullet.x}px`,
                      top: `${bullet.y}px`,
                      width: `${BULLET_WIDTH}px`,
                      height: `${BULLET_HEIGHT}px`,
                    }}
                  />
                ))}

                {/* Invader Bullets */}
                {invaderBullets.map((bullet) => (
                  <div
                    key={bullet.id}
                    className="absolute bg-red-400"
                    style={{
                      left: `${bullet.x}px`,
                      top: `${bullet.y}px`,
                      width: `${BULLET_WIDTH}px`,
                      height: `${BULLET_HEIGHT}px`,
                    }}
                  />
                ))}

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-red-400 mb-4">GAME OVER</h2>
                      <p className="text-green-400 mb-2">Score: {score}</p>
                      <p className="text-green-400 mb-4">Level: {level}</p>
                      <Button onClick={startGame} className="bg-green-600 hover:bg-green-700">
                        Play Again
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pause Overlay */}
                {isPaused && !gameOver && (
                  <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-yellow-400 mb-4">PAUSED</h2>
                      <Button onClick={togglePause} className="bg-yellow-600 hover:bg-yellow-700">
                        Resume
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Controls & Stats */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="bg-gray-900 border-green-400 p-4">
              <h3 className="text-xl font-bold text-green-400 mb-4">Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className="text-green-300">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span>High Score:</span>
                  <span className="text-yellow-400">{highScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lives:</span>
                  <span className="text-red-400">{"❤️".repeat(lives)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Level:</span>
                  <span className="text-cyan-400">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span>Invaders:</span>
                  <span className="text-red-400">{invaders.length}</span>
                </div>
              </div>
            </Card>

            {/* Game Controls */}
            <Card className="bg-gray-900 border-green-400 p-4">
              <h3 className="text-xl font-bold text-green-400 mb-4">Controls</h3>
              <div className="space-y-3">
                {!isPlaying ? (
                  <Button onClick={startGame} className="w-full bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                ) : (
                  <Button onClick={togglePause} className="w-full bg-yellow-600 hover:bg-yellow-700">
                    {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                )}

                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="w-full border-green-400 text-green-400 hover:bg-green-400 hover:text-black bg-transparent"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </Card>

            {/* Touch Controls */}
            <Card className="bg-gray-900 border-green-400 p-4 lg:hidden">
              <h3 className="text-xl font-bold text-green-400 mb-4">Movement</h3>
              <div className="flex gap-2 mb-4">
                <Button
                  onTouchStart={() => keysRef.current.add("arrowleft")}
                  onTouchEnd={() => keysRef.current.delete("arrowleft")}
                  onMouseDown={() => keysRef.current.add("arrowleft")}
                  onMouseUp={() => keysRef.current.delete("arrowleft")}
                  variant="outline"
                  className="flex-1 border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  onTouchStart={() => keysRef.current.add("arrowright")}
                  onTouchEnd={() => keysRef.current.delete("arrowright")}
                  onMouseDown={() => keysRef.current.add("arrowright")}
                  onMouseUp={() => keysRef.current.delete("arrowright")}
                  variant="outline"
                  className="flex-1 border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={shoot} className="w-full bg-red-600 hover:bg-red-700">
                <Zap className="w-4 h-4 mr-2" />
                Shoot
              </Button>
            </Card>

            {/* Instructions */}
            <Card className="bg-gray-900 border-green-400 p-4">
              <h3 className="text-xl font-bold text-green-400 mb-4">How to Play</h3>
              <div className="text-sm space-y-2">
                <p>• Use arrow keys or A/D to move</p>
                <p>• Press SPACE to shoot</p>
                <p>• Destroy all invaders to advance</p>
                <p>• Avoid invader bullets</p>
                <p>• Higher rows = more points</p>
                <p>• Press P to pause</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
