"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Play, Pause, RotateCcw, Home } from "lucide-react"
import Link from "next/link"

type Position = { x: number; y: number }
type Ball = Position & { vx: number; vy: number }
type Paddle = { y: number; score: number }

const GAME_WIDTH = 800
const GAME_HEIGHT = 400
const PADDLE_WIDTH = 10
const PADDLE_HEIGHT = 80
const BALL_SIZE = 10
const PADDLE_SPEED = 6
const INITIAL_BALL_SPEED = 4
const MAX_BALL_SPEED = 8

export default function PongGame() {
  const [ball, setBall] = useState<Ball>({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 2,
    vx: INITIAL_BALL_SPEED,
    vy: INITIAL_BALL_SPEED,
  })
  const [leftPaddle, setLeftPaddle] = useState<Paddle>({
    y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    score: 0,
  })
  const [rightPaddle, setRightPaddle] = useState<Paddle>({
    y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    score: 0,
  })
  const [gameMode, setGameMode] = useState<"single" | "multi">("single")
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [winner, setWinner] = useState<"left" | "right" | null>(null)
  const [ballSpeed, setBallSpeed] = useState(INITIAL_BALL_SPEED)

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const keysRef = useRef<Set<string>>(new Set())

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())

      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault()
        if (gameOver) {
          startGame()
        } else if (!isPlaying) {
          startGame()
        } else {
          togglePause()
        }
      } else if (e.key.toLowerCase() === "p") {
        e.preventDefault()
        togglePause()
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (!isPlaying) {
          startGame()
        }
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

  // AI for right paddle in single player mode
  const updateAI = useCallback(() => {
    if (gameMode === "single") {
      setRightPaddle((prev) => {
        const paddleCenter = prev.y + PADDLE_HEIGHT / 2
        const ballCenter = ball.y + BALL_SIZE / 2
        const diff = ballCenter - paddleCenter

        let newY = prev.y

        // Simple AI with some imperfection
        if (Math.abs(diff) > 5) {
          if (diff > 0) {
            newY += PADDLE_SPEED * 0.8 // Slightly slower than player
          } else {
            newY -= PADDLE_SPEED * 0.8
          }
        }

        // Keep paddle within bounds
        newY = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newY))

        return { ...prev, y: newY }
      })
    }
  }, [ball.y, gameMode])

  // Update paddles based on input
  const updatePaddles = useCallback(() => {
    if (!isPlaying || isPaused || gameOver) return

    // Left paddle (Player 1)
    setLeftPaddle((prev) => {
      let newY = prev.y

      if (keysRef.current.has("w") || keysRef.current.has("arrowup")) {
        newY -= PADDLE_SPEED
      }
      if (keysRef.current.has("s") || keysRef.current.has("arrowdown")) {
        newY += PADDLE_SPEED
      }

      // Keep paddle within bounds
      newY = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newY))

      return { ...prev, y: newY }
    })

    // Right paddle (Player 2 in multiplayer)
    if (gameMode === "multi") {
      setRightPaddle((prev) => {
        let newY = prev.y

        if (keysRef.current.has("i")) {
          newY -= PADDLE_SPEED
        }
        if (keysRef.current.has("k")) {
          newY += PADDLE_SPEED
        }

        // Keep paddle within bounds
        newY = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newY))

        return { ...prev, y: newY }
      })
    } else {
      updateAI()
    }
  }, [isPlaying, isPaused, gameOver, gameMode, updateAI])

  // Update ball
  const updateBall = useCallback(() => {
    if (!isPlaying || isPaused || gameOver) return

    setBall((prev) => {
      let newX = prev.x + prev.vx
      let newY = prev.y + prev.vy
      let newVx = prev.vx
      let newVy = prev.vy

      // Ball collision with top and bottom walls
      if (newY <= 0 || newY >= GAME_HEIGHT - BALL_SIZE) {
        newVy = -newVy
        newY = newY <= 0 ? 0 : GAME_HEIGHT - BALL_SIZE
      }

      // Ball collision with left paddle
      if (
        newX <= PADDLE_WIDTH &&
        newY + BALL_SIZE >= leftPaddle.y &&
        newY <= leftPaddle.y + PADDLE_HEIGHT &&
        newVx < 0
      ) {
        newVx = -newVx
        newX = PADDLE_WIDTH

        // Add some angle based on where ball hits paddle
        const paddleCenter = leftPaddle.y + PADDLE_HEIGHT / 2
        const ballCenter = newY + BALL_SIZE / 2
        const hitPos = (ballCenter - paddleCenter) / (PADDLE_HEIGHT / 2)
        newVy += hitPos * 2

        // Increase speed slightly
        const speed = Math.sqrt(newVx * newVx + newVy * newVy)
        const newSpeed = Math.min(speed * 1.05, MAX_BALL_SPEED)
        const ratio = newSpeed / speed
        newVx *= ratio
        newVy *= ratio
      }

      // Ball collision with right paddle
      if (
        newX + BALL_SIZE >= GAME_WIDTH - PADDLE_WIDTH &&
        newY + BALL_SIZE >= rightPaddle.y &&
        newY <= rightPaddle.y + PADDLE_HEIGHT &&
        newVx > 0
      ) {
        newVx = -newVx
        newX = GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE

        // Add some angle based on where ball hits paddle
        const paddleCenter = rightPaddle.y + PADDLE_HEIGHT / 2
        const ballCenter = newY + BALL_SIZE / 2
        const hitPos = (ballCenter - paddleCenter) / (PADDLE_HEIGHT / 2)
        newVy += hitPos * 2

        // Increase speed slightly
        const speed = Math.sqrt(newVx * newVx + newVy * newVy)
        const newSpeed = Math.min(speed * 1.05, MAX_BALL_SPEED)
        const ratio = newSpeed / speed
        newVx *= ratio
        newVy *= ratio
      }

      // Ball goes off left side (right player scores)
      if (newX < 0) {
        setRightPaddle((prev) => {
          const newScore = prev.score + 1
          if (newScore >= 11) {
            setWinner("right")
            setGameOver(true)
            setIsPlaying(false)
          }
          return { ...prev, score: newScore }
        })
        // Reset ball
        return {
          x: GAME_WIDTH / 2,
          y: GAME_HEIGHT / 2,
          vx: -INITIAL_BALL_SPEED,
          vy: (Math.random() - 0.5) * INITIAL_BALL_SPEED,
        }
      }

      // Ball goes off right side (left player scores)
      if (newX > GAME_WIDTH) {
        setLeftPaddle((prev) => {
          const newScore = prev.score + 1
          if (newScore >= 11) {
            setWinner("left")
            setGameOver(true)
            setIsPlaying(false)
          }
          return { ...prev, score: newScore }
        })
        // Reset ball
        return {
          x: GAME_WIDTH / 2,
          y: GAME_HEIGHT / 2,
          vx: INITIAL_BALL_SPEED,
          vy: (Math.random() - 0.5) * INITIAL_BALL_SPEED,
        }
      }

      return { x: newX, y: newY, vx: newVx, vy: newVy }
    })
  }, [isPlaying, isPaused, gameOver, leftPaddle.y, rightPaddle.y])

  // Game loop
  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        updatePaddles()
        updateBall()
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
  }, [isPlaying, isPaused, gameOver, updatePaddles, updateBall])

  const startGame = () => {
    setBall({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      vx: Math.random() > 0.5 ? INITIAL_BALL_SPEED : -INITIAL_BALL_SPEED,
      vy: (Math.random() - 0.5) * INITIAL_BALL_SPEED,
    })
    setLeftPaddle({
      y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      score: 0,
    })
    setRightPaddle({
      y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      score: 0,
    })
    setGameOver(false)
    setIsPlaying(true)
    setIsPaused(false)
    setWinner(null)
    setBallSpeed(INITIAL_BALL_SPEED)
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
    setWinner(null)
    setBall({
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT / 2,
      vx: INITIAL_BALL_SPEED,
      vy: INITIAL_BALL_SPEED,
    })
    setLeftPaddle({
      y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      score: 0,
    })
    setRightPaddle({
      y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      score: 0,
    })
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/public">
            <Button
              variant="outline"
              size="sm"
              className="border-white text-white hover:bg-white hover:text-black bg-transparent"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-center text-white animate-pulse">PONG</h1>
          <div className="w-20" />
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
                {/* Center line */}
                <div
                  className="absolute bg-white opacity-50"
                  style={{
                    left: `${GAME_WIDTH / 2 - 1}px`,
                    top: "0px",
                    width: "2px",
                    height: `${GAME_HEIGHT}px`,
                  }}
                />

                {/* Dashed center line */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-white opacity-30"
                    style={{
                      left: `${GAME_WIDTH / 2 - 1}px`,
                      top: `${i * 20}px`,
                      width: "2px",
                      height: "10px",
                    }}
                  />
                ))}

                {/* Left paddle */}
                <div
                  className="absolute bg-white"
                  style={{
                    left: "0px",
                    top: `${leftPaddle.y}px`,
                    width: `${PADDLE_WIDTH}px`,
                    height: `${PADDLE_HEIGHT}px`,
                  }}
                />

                {/* Right paddle */}
                <div
                  className="absolute bg-white"
                  style={{
                    left: `${GAME_WIDTH - PADDLE_WIDTH}px`,
                    top: `${rightPaddle.y}px`,
                    width: `${PADDLE_WIDTH}px`,
                    height: `${PADDLE_HEIGHT}px`,
                  }}
                />

                {/* Ball */}
                <div
                  className="absolute bg-white"
                  style={{
                    left: `${ball.x}px`,
                    top: `${ball.y}px`,
                    width: `${BALL_SIZE}px`,
                    height: `${BALL_SIZE}px`,
                  }}
                />

                {/* Scores */}
                <div className="absolute top-4 left-1/4 text-4xl font-bold text-white opacity-50">
                  {leftPaddle.score}
                </div>
                <div className="absolute top-4 right-1/4 text-4xl font-bold text-white opacity-50">
                  {rightPaddle.score}
                </div>

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-green-400 mb-4">
                        {winner === "left" ? "PLAYER 1 WINS!" : gameMode === "single" ? "AI WINS!" : "PLAYER 2 WINS!"}
                      </h2>
                      <p className="text-white mb-4">
                        Final Score: {leftPaddle.score} - {rightPaddle.score}
                      </p>
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
            {/* Game Mode */}
            <Card className="bg-gray-900 border-white p-4">
              <h3 className="text-xl font-bold text-white mb-4">Game Mode</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => setGameMode("single")}
                  variant={gameMode === "single" ? "default" : "outline"}
                  className="w-full"
                >
                  Single Player
                </Button>
                <Button
                  onClick={() => setGameMode("multi")}
                  variant={gameMode === "multi" ? "default" : "outline"}
                  className="w-full"
                >
                  Two Players
                </Button>
              </div>
            </Card>

            {/* Stats */}
            <Card className="bg-gray-900 border-white p-4">
              <h3 className="text-xl font-bold text-white mb-4">Score</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Player 1:</span>
                  <span className="text-green-400">{leftPaddle.score}</span>
                </div>
                <div className="flex justify-between">
                  <span>{gameMode === "single" ? "AI:" : "Player 2:"}</span>
                  <span className="text-red-400">{rightPaddle.score}</span>
                </div>
                <div className="text-sm text-gray-400 mt-2">First to 11 wins!</div>
              </div>
            </Card>

            {/* Game Controls */}
            <Card className="bg-gray-900 border-white p-4">
              <h3 className="text-xl font-bold text-white mb-4">Controls</h3>
              <div className="space-y-3">
                {!isPlaying ? (
                  <Button onClick={startGame} className="w-full bg-white text-black hover:bg-gray-200">
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
                  className="w-full border-white text-white hover:bg-white hover:text-black bg-transparent"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </Card>

            {/* Touch Controls */}
            <Card className="bg-gray-900 border-white p-4 lg:hidden">
              <h3 className="text-xl font-bold text-white mb-4">Player 1</h3>
              <div className="space-y-2">
                <Button
                  onTouchStart={() => keysRef.current.add("w")}
                  onTouchEnd={() => keysRef.current.delete("w")}
                  onMouseDown={() => keysRef.current.add("w")}
                  onMouseUp={() => keysRef.current.delete("w")}
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white hover:text-black"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Up
                </Button>
                <Button
                  onTouchStart={() => keysRef.current.add("s")}
                  onTouchEnd={() => keysRef.current.delete("s")}
                  onMouseDown={() => keysRef.current.add("s")}
                  onMouseUp={() => keysRef.current.delete("s")}
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white hover:text-black"
                >
                  <ArrowDown className="w-4 h-4 mr-2" />
                  Down
                </Button>
              </div>

              {gameMode === "multi" && (
                <>
                  <h3 className="text-xl font-bold text-white mb-4 mt-6">Player 2</h3>
                  <div className="space-y-2">
                    <Button
                      onTouchStart={() => keysRef.current.add("i")}
                      onTouchEnd={() => keysRef.current.delete("i")}
                      onMouseDown={() => keysRef.current.add("i")}
                      onMouseUp={() => keysRef.current.delete("i")}
                      variant="outline"
                      className="w-full border-white text-white hover:bg-white hover:text-black"
                    >
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Up (I)
                    </Button>
                    <Button
                      onTouchStart={() => keysRef.current.add("k")}
                      onTouchEnd={() => keysRef.current.delete("k")}
                      onMouseDown={() => keysRef.current.add("k")}
                      onMouseUp={() => keysRef.current.delete("k")}
                      variant="outline"
                      className="w-full border-white text-white hover:bg-white hover:text-black"
                    >
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Down (K)
                    </Button>
                  </div>
                </>
              )}
            </Card>

            {/* Instructions */}
            <Card className="bg-gray-900 border-white p-4">
              <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
              <div className="text-sm space-y-2">
                <p>• Player 1: W/S or Up/Down arrows</p>
                {gameMode === "multi" && <p>• Player 2: I/K keys</p>}
                <p>• Hit the ball with your paddle</p>
                <p>• First to 11 points wins</p>
                <p>• Ball speeds up after each hit</p>
                <p>• Press SPACE or P to pause</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
