"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Home, Zap } from "lucide-react"
import Link from "next/link"

type Vector = { x: number; y: number }
type GameObject = {
  position: Vector
  velocity: Vector
  rotation: number
  size: number
}

type Ship = GameObject & { thrust: boolean }
type Bullet = GameObject & { id: number; life: number }
type Asteroid = GameObject & { id: number; type: "large" | "medium" | "small" }

const GAME_WIDTH = 800
const GAME_HEIGHT = 600
const SHIP_SIZE = 15
const BULLET_SPEED = 8
const BULLET_LIFE = 60
const THRUST_POWER = 0.3
const ROTATION_SPEED = 5
const FRICTION = 0.98
const MAX_SPEED = 8

export function AsteroidsGame() {
  const [ship, setShip] = useState<Ship>({
    position: {x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2},
    velocity: {x: 0, y: 0},
    rotation: 0,
    size: SHIP_SIZE,
    thrust: false,
  })
  const [bullets, setBullets] = useState<Bullet[]>([])
  const [asteroids, setAsteroids] = useState<Asteroid[]>([])
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [invulnerable, setInvulnerable] = useState(false)

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const bulletIdRef = useRef(0)
  const asteroidIdRef = useRef(0)
  const keysRef = useRef<Set<string>>(new Set())

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem("asteroids-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Create asteroids for level
  const createAsteroids = useCallback((levelNum: number) => {
    const newAsteroids: Asteroid[] = []
    const asteroidCount = 4 + levelNum

    for (let i = 0; i < asteroidCount; i++) {
      let x, y
      do {
        x = Math.random() * GAME_WIDTH
        y = Math.random() * GAME_HEIGHT
      } while (Math.sqrt((x - GAME_WIDTH / 2) ** 2 + (y - GAME_HEIGHT / 2) ** 2) < 100)

      newAsteroids.push({
        id: asteroidIdRef.current++,
        position: {x, y},
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        rotation: Math.random() * 360,
        size: 40,
        type: "large",
      })
    }

    setAsteroids(newAsteroids)
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

  // Wrap position around screen
  const wrapPosition = useCallback((pos: Vector): Vector => {
    return {
      x: ((pos.x % GAME_WIDTH) + GAME_WIDTH) % GAME_WIDTH,
      y: ((pos.y % GAME_HEIGHT) + GAME_HEIGHT) % GAME_HEIGHT,
    }
  }, [])

  // Update ship
  const updateShip = useCallback(() => {
    if (!isPlaying || isPaused || gameOver) return

    setShip((prev) => {
      let newRotation = prev.rotation
      const newVelocity = {...prev.velocity}
      let thrust = false

      // Rotation
      if (keysRef.current.has("arrowleft") || keysRef.current.has("a")) {
        newRotation -= ROTATION_SPEED
      }
      if (keysRef.current.has("arrowright") || keysRef.current.has("d")) {
        newRotation += ROTATION_SPEED
      }

      // Thrust
      if (keysRef.current.has("arrowup") || keysRef.current.has("w")) {
        thrust = true
        const radians = (newRotation * Math.PI) / 180
        newVelocity.x += Math.cos(radians) * THRUST_POWER
        newVelocity.y += Math.sin(radians) * THRUST_POWER

        // Limit max speed
        const speed = Math.sqrt(newVelocity.x ** 2 + newVelocity.y ** 2)
        if (speed > MAX_SPEED) {
          newVelocity.x = (newVelocity.x / speed) * MAX_SPEED
          newVelocity.y = (newVelocity.y / speed) * MAX_SPEED
        }
      }

      // Apply friction
      newVelocity.x *= FRICTION
      newVelocity.y *= FRICTION

      // Update position
      const newPosition = wrapPosition({
        x: prev.position.x + newVelocity.x,
        y: prev.position.y + newVelocity.y,
      })

      return {
        ...prev,
        position: newPosition,
        velocity: newVelocity,
        rotation: newRotation,
        thrust,
      }
    })
  }, [isPlaying, isPaused, gameOver, wrapPosition])

  // Shoot bullet
  const shoot = useCallback(() => {
    if (!isPlaying || isPaused || gameOver) return

    setBullets((prev) => {
      const radians = (ship.rotation * Math.PI) / 180
      const newBullet: Bullet = {
        id: bulletIdRef.current++,
        position: {...ship.position},
        velocity: {
          x: Math.cos(radians) * BULLET_SPEED + ship.velocity.x,
          y: Math.sin(radians) * BULLET_SPEED + ship.velocity.y,
        },
        rotation: 0,
        size: 2,
        life: BULLET_LIFE,
      }

      return [...prev, newBullet]
    })
  }, [ship, isPlaying, isPaused, gameOver])

  // Update bullets
  const updateBullets = useCallback(() => {
    setBullets((prev) =>
        prev
            .map((bullet) => ({
              ...bullet,
              position: wrapPosition({
                x: bullet.position.x + bullet.velocity.x,
                y: bullet.position.y + bullet.velocity.y,
              }),
              life: bullet.life - 1,
            }))
            .filter((bullet) => bullet.life > 0),
    )
  }, [wrapPosition])

  // Update asteroids
  const updateAsteroids = useCallback(() => {
    setAsteroids((prev) =>
        prev.map((asteroid) => ({
          ...asteroid,
          position: wrapPosition({
            x: asteroid.position.x + asteroid.velocity.x,
            y: asteroid.position.y + asteroid.velocity.y,
          }),
          rotation: asteroid.rotation + 1,
        })),
    )
  }, [wrapPosition])

  // Check collisions
  const checkCollisions = useCallback(() => {
    // Bullets vs asteroids
    setBullets((prevBullets) => {
      const remainingBullets = [...prevBullets]

      setAsteroids((prevAsteroids) => {
        const remainingAsteroids = [...prevAsteroids]

        prevBullets.forEach((bullet) => {
          const hitAsteroidIndex = remainingAsteroids.findIndex((asteroid) => {
            const dx = bullet.position.x - asteroid.position.x
            const dy = bullet.position.y - asteroid.position.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance < asteroid.size
          })

          if (hitAsteroidIndex !== -1) {
            const hitAsteroid = remainingAsteroids[hitAsteroidIndex]

            // Score points
            const points = hitAsteroid.type === "large" ? 20 : hitAsteroid.type === "medium" ? 50 : 100
            setScore((prev) => {
              const newScore = prev + points
              if (newScore > highScore) {
                setHighScore(newScore)
                localStorage.setItem("asteroids-high-score", newScore.toString())
              }
              return newScore
            })

            // Break asteroid into smaller pieces
            if (hitAsteroid.type === "large") {
              for (let i = 0; i < 2; i++) {
                remainingAsteroids.push({
                  id: asteroidIdRef.current++,
                  position: {...hitAsteroid.position},
                  velocity: {
                    x: (Math.random() - 0.5) * 3,
                    y: (Math.random() - 0.5) * 3,
                  },
                  rotation: Math.random() * 360,
                  size: 25,
                  type: "medium",
                })
              }
            } else if (hitAsteroid.type === "medium") {
              for (let i = 0; i < 2; i++) {
                remainingAsteroids.push({
                  id: asteroidIdRef.current++,
                  position: {...hitAsteroid.position},
                  velocity: {
                    x: (Math.random() - 0.5) * 4,
                    y: (Math.random() - 0.5) * 4,
                  },
                  rotation: Math.random() * 360,
                  size: 12,
                  type: "small",
                })
              }
            }

            remainingAsteroids.splice(hitAsteroidIndex, 1)
            const bulletIndex = remainingBullets.findIndex((b) => b.id === bullet.id)
            if (bulletIndex !== -1) {
              remainingBullets.splice(bulletIndex, 1)
            }
          }
        })

        // Check if level complete
        if (remainingAsteroids.length === 0) {
          setLevel((prev) => prev + 1)
          setTimeout(() => {
            createAsteroids(level + 1)
          }, 1000)
        }

        return remainingAsteroids
      })

      return remainingBullets
    })

    // Ship vs asteroids
    if (!invulnerable) {
      const shipHit = asteroids.some((asteroid) => {
        const dx = ship.position.x - asteroid.position.x
        const dy = ship.position.y - asteroid.position.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < asteroid.size + ship.size
      })

      if (shipHit) {
        setLives((prev) => {
          const newLives = prev - 1
          if (newLives <= 0) {
            setGameOver(true)
            setIsPlaying(false)
          } else {
            // Reset ship position and make invulnerable
            setShip((prev) => ({
              ...prev,
              position: {x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2},
              velocity: {x: 0, y: 0},
              rotation: 0,
            }))
            setInvulnerable(true)
            setTimeout(() => setInvulnerable(false), 2000)
          }
          return newLives
        })
      }
    }
  }, [bullets, asteroids, ship, invulnerable, highScore, level, createAsteroids])

  // Game loop
  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        updateShip()
        updateBullets()
        updateAsteroids()
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
  }, [isPlaying, isPaused, gameOver, updateShip, updateBullets, updateAsteroids, checkCollisions])

  const startGame = () => {
    setShip({
      position: {x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2},
      velocity: {x: 0, y: 0},
      rotation: 0,
      size: SHIP_SIZE,
      thrust: false,
    })
    setBullets([])
    createAsteroids(1)
    setScore(0)
    setLives(3)
    setLevel(1)
    setGameOver(false)
    setIsPlaying(true)
    setIsPaused(false)
    setInvulnerable(false)
    bulletIdRef.current = 0
    asteroidIdRef.current = 0
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
    setBullets([])
    setAsteroids([])
    setScore(0)
    setLives(3)
    setLevel(1)
    setInvulnerable(false)
  }

  return (
      <div className="min-h-screen bg-black text-white p-4 font-mono">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <Button
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-black bg-transparent"
              >
                <Home className="w-4 h-4 mr-2"/>
                Home
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-center text-white animate-pulse">ASTEROIDS</h1>
            <div className="w-20"/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game Board */}
            <div className="lg:col-span-3">
              <Card className="bg-gray-900 border-white p-4">
                <div
                    className="relative bg-black border-2 border-white mx-auto overflow-hidden"
                    style={{
                      width: `${GAME_WIDTH}px`,
                      height: `${GAME_HEIGHT}px`,
                      maxWidth: "100%",
                    }}
                >
                  {/* Stars background */}
                  <div className="absolute inset-0">
                    {Array.from({length: 100}).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white opacity-40"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                            }}
                        />
                    ))}
                  </div>

                  {/* Ship */}
                  <div
                      className={`absolute ${invulnerable ? "opacity-50 animate-pulse" : ""}`}
                      style={{
                        left: `${ship.position.x}px`,
                        top: `${ship.position.y}px`,
                        transform: `translate(-50%, -50%) rotate(${ship.rotation}deg)`,
                      }}
                  >
                    <svg width={ship.size * 2} height={ship.size * 2} viewBox="0 0 30 30">
                      <polygon points="15,5 25,25 15,20 5,25" fill="none" stroke="white" strokeWidth="2"/>
                      {ship.thrust && <polygon points="15,20 12,28 18,28" fill="orange" stroke="red" strokeWidth="1"/>}
                    </svg>
                  </div>

                  {/* Asteroids */}
                  {asteroids.map((asteroid) => (
                      <div
                          key={asteroid.id}
                          className="absolute"
                          style={{
                            left: `${asteroid.position.x}px`,
                            top: `${asteroid.position.y}px`,
                            transform: `translate(-50%, -50%) rotate(${asteroid.rotation}deg)`,
                          }}
                      >
                        <svg width={asteroid.size * 2} height={asteroid.size * 2} viewBox="0 0 80 80">
                          <polygon
                              points="40,5 65,15 75,40 60,65 35,70 15,55 5,30 20,10"
                              fill="none"
                              stroke={asteroid.type === "large" ? "#888" : asteroid.type === "medium" ? "#aaa" : "#ccc"}
                              strokeWidth="2"
                          />
                        </svg>
                      </div>
                  ))}

                  {/* Bullets */}
                  {bullets.map((bullet) => (
                      <div
                          key={bullet.id}
                          className="absolute bg-white rounded-full"
                          style={{
                            left: `${bullet.position.x}px`,
                            top: `${bullet.position.y}px`,
                            width: `${bullet.size * 2}px`,
                            height: `${bullet.size * 2}px`,
                            transform: "translate(-50%, -50%)",
                          }}
                      />
                  ))}

                  {/* Game Over Overlay */}
                  {gameOver && (
                      <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                        <div className="text-center">
                          <h2 className="text-3xl font-bold text-red-400 mb-4">GAME OVER</h2>
                          <p className="text-white mb-2">Score: {score}</p>
                          <p className="text-white mb-4">Level: {level}</p>
                          <Button onClick={startGame} className="bg-white text-black hover:bg-gray-200">
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
              <Card className="bg-gray-900 border-white p-4">
                <h3 className="text-xl font-bold text-white mb-4">Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Score:</span>
                    <span className="text-green-400">{score}</span>
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
                    <span>Asteroids:</span>
                    <span className="text-gray-400">{asteroids.length}</span>
                  </div>
                </div>
              </Card>

              {/* Game Controls */}
              <Card className="bg-gray-900 border-white p-4">
                <h3 className="text-xl font-bold text-white mb-4">Controls</h3>
                <div className="space-y-3">
                  {!isPlaying ? (
                      <Button onClick={startGame} className="w-full bg-white text-black hover:bg-gray-200">
                        <Play className="w-4 h-4 mr-2"/>
                        Start Game
                      </Button>
                  ) : (
                      <Button onClick={togglePause} className="w-full bg-yellow-600 hover:bg-yellow-700">
                        {isPaused ? <Play className="w-4 h-4 mr-2"/> : <Pause className="w-4 h-4 mr-2"/>}
                        {isPaused ? "Resume" : "Pause"}
                      </Button>
                  )}

                  <Button
                      onClick={resetGame}
                      variant="outline"
                      className="w-full border-white text-white hover:bg-white hover:text-black bg-transparent"
                  >
                    <RotateCcw className="w-4 h-4 mr-2"/>
                    Reset
                  </Button>
                </div>
              </Card>

              {/* Touch Controls */}
              <Card className="bg-gray-900 border-white p-4 lg:hidden">
                <h3 className="text-xl font-bold text-white mb-4">Controls</h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Button
                      onTouchStart={() => keysRef.current.add("arrowleft")}
                      onTouchEnd={() => keysRef.current.delete("arrowleft")}
                      onMouseDown={() => keysRef.current.add("arrowleft")}
                      onMouseUp={() => keysRef.current.delete("arrowleft")}
                      variant="outline"
                      size="sm"
                      className="border-white text-white hover:bg-white hover:text-black"
                  >
                    <ArrowLeft className="w-4 h-4"/>
                  </Button>
                  <Button
                      onTouchStart={() => keysRef.current.add("arrowup")}
                      onTouchEnd={() => keysRef.current.delete("arrowup")}
                      onMouseDown={() => keysRef.current.add("arrowup")}
                      onMouseUp={() => keysRef.current.delete("arrowup")}
                      variant="outline"
                      size="sm"
                      className="border-white text-white hover:bg-white hover:text-black"
                  >
                    <ArrowUp className="w-4 h-4"/>
                  </Button>
                  <Button
                      onTouchStart={() => keysRef.current.add("arrowright")}
                      onTouchEnd={() => keysRef.current.delete("arrowright")}
                      onMouseDown={() => keysRef.current.add("arrowright")}
                      onMouseUp={() => keysRef.current.delete("arrowright")}
                      variant="outline"
                      size="sm"
                      className="border-white text-white hover:bg-white hover:text-black"
                  >
                    <ArrowRight className="w-4 h-4"/>
                  </Button>
                </div>
                <Button onClick={shoot} className="w-full bg-red-600 hover:bg-red-700">
                  <Zap className="w-4 h-4 mr-2"/>
                  Shoot
                </Button>
              </Card>

              {/* Instructions */}
              <Card className="bg-gray-900 border-white p-4">
                <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
                <div className="text-sm space-y-2">
                  <p>• Left/Right arrows or A/D to rotate</p>
                  <p>• Up arrow or W to thrust</p>
                  <p>• SPACE to shoot</p>
                  <p>• Destroy all asteroids to advance</p>
                  <p>• Large asteroids break into smaller ones</p>
                  <p>• Press P to pause</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
  )
}
