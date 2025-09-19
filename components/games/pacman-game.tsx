"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Home } from "lucide-react"
import Link from "next/link"

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type Position = { x: number; y: number }
type CellType = "wall" | "dot" | "empty" | "power" | "ghost-spawn"

const GRID_WIDTH = 19
const GRID_HEIGHT = 21
const CELL_SIZE = 20

// Simple maze layout (1 = wall, 0 = dot, 2 = empty, 3 = power pellet, 4 = ghost spawn)
const MAZE_LAYOUT = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 3, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 3, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1],
  [2, 2, 2, 1, 0, 1, 2, 2, 2, 4, 2, 2, 2, 1, 0, 1, 2, 2, 2],
  [1, 1, 1, 1, 0, 1, 2, 1, 4, 4, 4, 1, 2, 1, 0, 1, 1, 1, 1],
  [2, 2, 2, 2, 0, 2, 2, 1, 4, 4, 4, 1, 2, 2, 0, 2, 2, 2, 2],
  [1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1],
  [2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2],
  [1, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 3, 1],
  [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

const INITIAL_PACMAN = { x: 9, y: 15 }
const INITIAL_GHOSTS = [
  { x: 9, y: 9, color: "red", direction: "UP" as Direction },
  { x: 8, y: 9, color: "pink", direction: "LEFT" as Direction },
  { x: 10, y: 9, color: "cyan", direction: "RIGHT" as Direction },
  { x: 9, y: 10, color: "orange", direction: "DOWN" as Direction },
]

type Ghost = {
  x: number
  y: number
  color: string
  direction: Direction
}

export default function PacManGame() {
  const [pacman, setPacman] = useState<Position>(INITIAL_PACMAN)
  const [ghosts, setGhosts] = useState<Ghost[]>(INITIAL_GHOSTS)
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [maze, setMaze] = useState<CellType[][]>(() =>
    MAZE_LAYOUT.map((row) =>
      row.map((cell) => {
        switch (cell) {
          case 1:
            return "wall"
          case 0:
            return "dot"
          case 2:
            return "empty"
          case 3:
            return "power"
          case 4:
            return "ghost-spawn"
          default:
            return "empty"
        }
      }),
    ),
  )
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [powerMode, setPowerMode] = useState(false)
  const [powerModeTimer, setPowerModeTimer] = useState(0)

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const nextDirectionRef = useRef<Direction>("RIGHT")

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem("pacman-high-score")
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore))
    }
  }, [])

  // Power mode timer
  useEffect(() => {
    if (powerMode && powerModeTimer > 0) {
      const timer = setTimeout(() => {
        setPowerModeTimer((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (powerModeTimer === 0) {
      setPowerMode(false)
    }
  }, [powerMode, powerModeTimer])

  const isValidMove = useCallback(
    (x: number, y: number): boolean => {
      if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return false
      return maze[y][x] !== "wall"
    },
    [maze],
  )

  const moveGhosts = useCallback(() => {
    setGhosts((prevGhosts) =>
      prevGhosts.map((ghost) => {
        const directions: Direction[] = ["UP", "DOWN", "LEFT", "RIGHT"]
        const possibleMoves = directions.filter((dir) => {
          let newX = ghost.x
          let newY = ghost.y

          switch (dir) {
            case "UP":
              newY--
              break
            case "DOWN":
              newY++
              break
            case "LEFT":
              newX--
              break
            case "RIGHT":
              newX++
              break
          }

          return isValidMove(newX, newY)
        })

        if (possibleMoves.length === 0) return ghost

        // Simple AI: prefer moving toward Pac-Man
        const bestDirection = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]

        const newPos = { ...ghost }
        switch (bestDirection) {
          case "UP":
            newPos.y--
            break
          case "DOWN":
            newPos.y++
            break
          case "LEFT":
            newPos.x--
            break
          case "RIGHT":
            newPos.x++
            break
        }

        return { ...newPos, direction: bestDirection, color: ghost.color }
      }),
    )
  }, [isValidMove])

  const checkCollisions = useCallback(() => {
    // Check ghost collisions
    const ghostCollision = ghosts.some((ghost) => ghost.x === pacman.x && ghost.y === pacman.y)

    if (ghostCollision) {
      if (powerMode) {
        // Eat ghost (in a real game, we'd remove the ghost temporarily)
        setScore((prev) => prev + 200)
      } else {
        setLives((prev) => {
          const newLives = prev - 1
          if (newLives <= 0) {
            setGameOver(true)
            setIsPlaying(false)
          }
          return newLives
        })
        // Reset positions
        setPacman(INITIAL_PACMAN)
        setGhosts(INITIAL_GHOSTS)
      }
    }
  }, [pacman, ghosts, powerMode])

  const movePacman = useCallback(() => {
    if (gameOver || isPaused || !isPlaying) return

    setPacman((currentPos) => {
      const currentDirection = nextDirectionRef.current
      let newX = currentPos.x
      let newY = currentPos.y

      switch (currentDirection) {
        case "UP":
          newY--
          break
        case "DOWN":
          newY++
          break
        case "LEFT":
          newX--
          break
        case "RIGHT":
          newX++
          break
      }

      // Tunnel effect (wrap around)
      if (newX < 0) newX = GRID_WIDTH - 1
      if (newX >= GRID_WIDTH) newX = 0

      if (!isValidMove(newX, newY)) {
        return currentPos
      }

      // Check for dots and power pellets
      const cellType = maze[newY][newX]
      if (cellType === "dot") {
        setScore((prev) => {
          const newScore = prev + 10
          if (newScore > highScore) {
            setHighScore(newScore)
            localStorage.setItem("pacman-high-score", newScore.toString())
          }
          return newScore
        })
        setMaze((prevMaze) => {
          const newMaze = [...prevMaze]
          newMaze[newY] = [...newMaze[newY]]
          newMaze[newY][newX] = "empty"
          return newMaze
        })
      } else if (cellType === "power") {
        setScore((prev) => prev + 50)
        setPowerMode(true)
        setPowerModeTimer(10)
        setMaze((prevMaze) => {
          const newMaze = [...prevMaze]
          newMaze[newY] = [...newMaze[newY]]
          newMaze[newY][newX] = "empty"
          return newMaze
        })
      }

      return { x: newX, y: newY }
    })
  }, [gameOver, isPaused, isPlaying, maze, isValidMove, highScore])

  // Game loop
  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      gameLoopRef.current = setInterval(() => {
        movePacman()
        moveGhosts()
        checkCollisions()
      }, 200)
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
  }, [isPlaying, isPaused, gameOver, movePacman, moveGhosts, checkCollisions])

  const changeDirection = useCallback(
    (newDirection: Direction) => {
      if (!isPlaying || isPaused || gameOver) return
      setDirection(newDirection)
      nextDirectionRef.current = newDirection
    },
    [isPlaying, isPaused, gameOver],
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
    setPacman(INITIAL_PACMAN)
    setGhosts(INITIAL_GHOSTS)
    setDirection("RIGHT")
    nextDirectionRef.current = "RIGHT"
    setMaze(
      MAZE_LAYOUT.map((row) =>
        row.map((cell) => {
          switch (cell) {
            case 1:
              return "wall"
            case 0:
              return "dot"
            case 2:
              return "empty"
            case 3:
              return "power"
            case 4:
              return "ghost-spawn"
            default:
              return "empty"
          }
        }),
      ),
    )
    setScore(0)
    setLives(3)
    setGameOver(false)
    setIsPlaying(true)
    setIsPaused(false)
    setPowerMode(false)
    setPowerModeTimer(0)
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
    setPacman(INITIAL_PACMAN)
    setGhosts(INITIAL_GHOSTS)
    setDirection("RIGHT")
    nextDirectionRef.current = "RIGHT"
    setScore(0)
    setLives(3)
    setPowerMode(false)
    setPowerModeTimer(0)
  }

  const renderCell = (cellType: CellType, x: number, y: number) => {
    const isPacmanHere = pacman.x === x && pacman.y === y
    const ghost = ghosts.find((g) => g.x === x && g.y === y)

    return (
      <div
        key={`${x}-${y}`}
        className="absolute"
        style={{
          left: `${x * CELL_SIZE}px`,
          top: `${y * CELL_SIZE}px`,
          width: `${CELL_SIZE}px`,
          height: `${CELL_SIZE}px`,
        }}
      >
        {/* Background */}
        {cellType === "wall" && <div className="w-full h-full bg-blue-600 border border-blue-400" />}

        {/* Dots */}
        {cellType === "dot" && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1 h-1 bg-yellow-300 rounded-full" />
          </div>
        )}

        {/* Power pellets */}
        {cellType === "power" && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse" />
          </div>
        )}

        {/* Pac-Man */}
        {isPacmanHere && (
          <div className="w-full h-full flex items-center justify-center">
            <div className={`w-4 h-4 rounded-full ${powerMode ? "bg-yellow-200" : "bg-yellow-400"} animate-pulse`} />
          </div>
        )}

        {/* Ghosts */}
        {ghost && (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className={`w-4 h-4 rounded-t-full ${
                powerMode
                  ? "bg-blue-400"
                  : ghost.color === "red"
                    ? "bg-red-500"
                    : ghost.color === "pink"
                      ? "bg-pink-500"
                      : ghost.color === "cyan"
                        ? "bg-cyan-500"
                        : "bg-orange-500"
              }`}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-yellow-400 p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/public">
            <Button
              variant="outline"
              size="sm"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-center text-yellow-400 animate-pulse">PAC-MAN</h1>
          <div className="w-20" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-yellow-400 p-4">
              <div
                className="relative bg-black border-2 border-yellow-400 mx-auto"
                style={{
                  width: `${GRID_WIDTH * CELL_SIZE}px`,
                  height: `${GRID_HEIGHT * CELL_SIZE}px`,
                }}
              >
                {/* Render maze */}
                {maze.map((row, y) => row.map((cell, x) => renderCell(cell, x, y)))}

                {/* Game Over Overlay */}
                {gameOver && (
                  <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-red-400 mb-4">GAME OVER</h2>
                      <p className="text-yellow-400 mb-4">Score: {score}</p>
                      <Button onClick={startGame} className="bg-yellow-600 hover:bg-yellow-700">
                        Play Again
                      </Button>
                    </div>
                  </div>
                )}

                {/* Pause Overlay */}
                {isPaused && !gameOver && (
                  <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-blue-400 mb-4">PAUSED</h2>
                      <Button onClick={togglePause} className="bg-blue-600 hover:bg-blue-700">
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
            <Card className="bg-gray-900 border-yellow-400 p-4">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className="text-yellow-300">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span>High Score:</span>
                  <span className="text-orange-400">{highScore}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lives:</span>
                  <span className="text-red-400">{"❤️".repeat(lives)}</span>
                </div>
                {powerMode && (
                  <div className="flex justify-between">
                    <span>Power:</span>
                    <span className="text-blue-400">{powerModeTimer}s</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Game Controls */}
            <Card className="bg-gray-900 border-yellow-400 p-4">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Controls</h3>
              <div className="space-y-3">
                {!isPlaying ? (
                  <Button onClick={startGame} className="w-full bg-yellow-600 hover:bg-yellow-700">
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </Button>
                ) : (
                  <Button onClick={togglePause} className="w-full bg-blue-600 hover:bg-blue-700">
                    {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                )}

                <Button
                  onClick={resetGame}
                  variant="outline"
                  className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-transparent"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </Card>

            {/* Touch Controls */}
            <Card className="bg-gray-900 border-yellow-400 p-4 lg:hidden">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Direction</h3>
              <div className="grid grid-cols-3 gap-2">
                <div></div>
                <Button
                  onClick={() => changeDirection("UP")}
                  variant="outline"
                  size="sm"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <div></div>
                <Button
                  onClick={() => changeDirection("LEFT")}
                  variant="outline"
                  size="sm"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div></div>
                <Button
                  onClick={() => changeDirection("RIGHT")}
                  variant="outline"
                  size="sm"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <div></div>
                <Button
                  onClick={() => changeDirection("DOWN")}
                  variant="outline"
                  size="sm"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <div></div>
              </div>
            </Card>

            {/* Instructions */}
            <Card className="bg-gray-900 border-yellow-400 p-4">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">How to Play</h3>
              <div className="text-sm space-y-2">
                <p>• Use arrow keys or WASD to move</p>
                <p>• Eat all dots to win</p>
                <p>• Avoid the colorful ghosts</p>
                <p>• Power pellets make ghosts vulnerable</p>
                <p>• Press SPACE or P to pause</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
