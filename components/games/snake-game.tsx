"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Home } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type Position = { x: number; y: number }

const GRID_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION: Direction = "RIGHT"
const INITIAL_FOOD = { x: 15, y: 15 }

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [food, setFood] = useState<Position>(INITIAL_FOOD)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [speed, setSpeed] = useState(200)

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const nextDirectionRef = useRef<Direction>(INITIAL_DIRECTION)

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("snake-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  // Check collision with walls or self
  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true
    }
    // Self collision
    return body.some((segment) => segment.x === head.x && segment.y === head.y)
  }, [])

  // Move snake
  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !isPlaying) return

    setSnake((currentSnake) => {
      const currentDirection = nextDirectionRef.current
      const head = currentSnake[0]
      let newHead: Position

      switch (currentDirection) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 }
          break
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 }
          break
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y }
          break
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y }
          break
      }

      // Check collision
      if (checkCollision(newHead, currentSnake)) {
        setGameOver(true)
        setIsPlaying(false)
        return currentSnake
      }

      const newSnake = [newHead, ...currentSnake]

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => {
          const newScore = prev + 10
          if (newScore > highScore) {
            setHighScore(newScore)
            localStorage.setItem("snake-high-score", newScore.toString())
          }
          return newScore
        })
        setFood(generateFood(newSnake))

        // Increase speed every 50 points
        if ((score + 10) % 50 === 0) {
          setSpeed((prev) => Math.max(100, prev - 20))
        }

        return newSnake
      } else {
        return newSnake.slice(0, -1)
      }
    })
  }, [gameOver, isPaused, isPlaying, food, checkCollision, generateFood, score, highScore])

  // Game loop
  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, speed)
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
  }, [isPlaying, isPaused, gameOver, moveSnake, speed])

  // Handle direction change
  const changeDirection = useCallback(
    (newDirection: Direction) => {
      if (!isPlaying || isPaused || gameOver) return

      const opposites: Record<Direction, Direction> = {
        UP: "DOWN",
        DOWN: "UP",
        LEFT: "RIGHT",
        RIGHT: "LEFT",
      }

      if (opposites[direction] !== newDirection) {
        setDirection(newDirection)
        nextDirectionRef.current = newDirection
      }
    },
    [direction, isPlaying, isPaused, gameOver],
  )

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault()
          changeDirection("UP")
          break
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault()
          changeDirection("DOWN")
          break
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault()
          changeDirection("LEFT")
          break
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault()
          changeDirection("RIGHT")
          break
        case " ":
          e.preventDefault()
          if (gameOver) {
            startGame()
          } else {
            togglePause()
          }
          break
        case "Enter":
          e.preventDefault()
          if (!isPlaying) {
            startGame()
          }
          break
        case "p":
        case "P":
          e.preventDefault()
          togglePause()
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [changeDirection, gameOver, isPlaying])

  const startGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    nextDirectionRef.current = INITIAL_DIRECTION
    setFood(generateFood(INITIAL_SNAKE))
    setGameOver(false)
    setScore(0)
    setIsPlaying(true)
    setIsPaused(false)
    setSpeed(200)
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
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    nextDirectionRef.current = INITIAL_DIRECTION
    setFood(INITIAL_FOOD)
    setScore(0)
    setSpeed(200)
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-4xl font-bold text-center text-green-400 animate-pulse">SNAKE</h1>
          <div className="w-20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-green-400 p-4">
              <div
                className="relative bg-black border-2 border-green-400 mx-auto"
                style={{
                  width: `${GRID_SIZE * 20}px`,
                  height: `${GRID_SIZE * 20}px`,
                  maxWidth: "100%",
                  aspectRatio: "1",
                }}
              >
                {/* Grid */}
                <div className="absolute inset-0 opacity-20">
                  {Array.from({ length: GRID_SIZE }).map((_, row) =>
                    Array.from({ length: GRID_SIZE }).map((_, col) => (
                      <div
                        key={`${row}-${col}`}
                        className="absolute border border-green-400"
                        style={{
                          left: `${col * 20}px`,
                          top: `${row * 20}px`,
                          width: "20px",
                          height: "20px",
                        }}
                      />
                    )),
                  )}
                </div>

                {snake.map((segment, index) => {
                  let rotation = 0;

                  // Head rotation comes from current direction
                  if (index === 0) {
                    switch (direction) {
                      case "UP":
                        rotation = 0;
                        break;
                      case "DOWN":
                        rotation = 180;
                        break;
                      case "LEFT":
                        rotation = -90;
                        break;
                      case "RIGHT":
                        rotation = 90;
                        break;
                    }
                  } else {
                    // Body or Tail rotation comes from relative position to previous segment
                    const prev = snake[index - 1];
                    if (prev) {
                      const dx = segment.x - prev.x;
                      const dy = segment.y - prev.y;

                      if (dx === 1) rotation = 90; // right
                      else if (dx === -1) rotation = -90; // left
                      else if (dy === 1) rotation = 180; // down
                      else if (dy === -1) rotation = 0; // up
                    }
                  }

                  return (
                      <div
                          key={index}
                          className="absolute transition-all duration-75"
                          style={{
                            left: `${segment.x * 20}px`,
                            top: `${segment.y * 20}px`,
                            width: "20px",
                            height: "20px",
                          }}
                      >
                        {index === 0 ? (
                            // Head
                            <Image
                                src="/head.png"
                                alt="Snake Head"
                                width={20}
                                height={20}
                                className="w-full h-full"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            />
                        ) : index === snake.length - 1 ? (
                            // Tail
                            <Image
                                src="/tail.png"
                                alt="Snake Tail"
                                width={20}
                                height={20}
                                className="w-full h-full"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            />
                        ) : (
                            // Body
                            <Image
                                src="/body.png"
                                alt="Snake Body"
                                width={20}
                                height={20}
                                className="w-full h-full"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            />
                        )}
                      </div>
                  );
                })}

                {/* Food */}
                <div
                  className="absolute bg-red-500 rounded-2xl border-2 border-red-300 animate-pulse"
                  style={{
                    left: `${food.x * 20}px`,
                    top: `${food.y * 20}px`,
                    width: "20px",
                    height: "20px",
                  }}
                />

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-red-400 mb-4">GAME OVER</h2>
                      <p className="text-green-400 mb-4">Score: {score}</p>
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
                  <span>Length:</span>
                  <span className="text-green-300">{snake.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Speed:</span>
                  <span className="text-green-300">{Math.round((300 - speed) / 20)}</span>
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
              <h3 className="text-xl font-bold text-green-400 mb-4">Direction</h3>
              <div className="grid grid-cols-3 gap-2">
                <div></div>
                <Button
                  onClick={() => changeDirection("UP")}
                  variant="outline"
                  size="sm"
                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <div></div>
                <Button
                  onClick={() => changeDirection("LEFT")}
                  variant="outline"
                  size="sm"
                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div></div>
                <Button
                  onClick={() => changeDirection("RIGHT")}
                  variant="outline"
                  size="sm"
                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <div></div>
                <Button
                  onClick={() => changeDirection("DOWN")}
                  variant="outline"
                  size="sm"
                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <div></div>
              </div>
            </Card>

            {/* Instructions */}
            <Card className="bg-gray-900 border-green-400 p-4">
              <h3 className="text-xl font-bold text-green-400 mb-4">How to Play</h3>
              <div className="text-sm space-y-2">
                <p>• Use arrow keys or WASD to move</p>
                <p>• Eat red food to grow and score</p>
                <p>• Avoid walls and your own tail</p>
                <p>• Press SPACE or P to pause</p>
                <p>• Speed increases every 50 points</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
