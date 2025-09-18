"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCw, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link";

// Tetris piece definitions
const PIECES = {
  I: {
    shape: [[1, 1, 1, 1]],
    color: "bg-[color:var(--color-tetris-i)]",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "bg-[color:var(--color-tetris-o)]",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: "bg-[color:var(--color-tetris-t)]",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "bg-[color:var(--color-tetris-s)]",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "bg-[color:var(--color-tetris-z)]",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: "bg-[color:var(--color-tetris-j)]",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: "bg-[color:var(--color-tetris-l)]",
  },
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const PIECE_TYPES = Object.keys(PIECES) as (keyof typeof PIECES)[]

interface Position {
  x: number
  y: number
}

interface Piece {
  type: keyof typeof PIECES
  shape: number[][]
  position: Position
  color: string
}

export default function TetrisGame() {
  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null)),
  )
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const dropTimeRef = useRef(1000)

  // Generate random piece
  const generatePiece = useCallback((): Piece => {
    const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
    const piece = PIECES[type]
    return {
      type,
      shape: piece.shape,
      position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2), y: 0 },
      color: piece.color,
    }
  }, [])

  // Check collision
  const checkCollision = useCallback((piece: Piece, board: (string | null)[][], offset: Position = { x: 0, y: 0 }) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.position.x + x + offset.x
          const newY = piece.position.y + y + offset.y

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true
          }

          if (newY >= 0 && board[newY][newX]) {
            return true
          }
        }
      }
    }
    return false
  }, [])

  // Rotate piece
  const rotatePiece = useCallback((piece: Piece): Piece => {
    const rotated = piece.shape[0].map((_, index) => piece.shape.map((row) => row[index]).reverse())
    return { ...piece, shape: rotated }
  }, [])

  // Place piece on board
  const placePiece = useCallback((piece: Piece, board: (string | null)[][]) => {
    const newBoard = board.map((row) => [...row])

    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.position.y + y
          const boardX = piece.position.x + x
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color
          }
        }
      }
    }

    return newBoard
  }, [])

  // Clear completed lines
  const clearLines = useCallback((board: (string | null)[][]) => {
    const newBoard = board.filter((row) => row.some((cell) => cell === null))
    const clearedLines = BOARD_HEIGHT - newBoard.length

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null))
    }

    return { board: newBoard, clearedLines }
  }, [])

  // Move piece
  const movePiece = useCallback(
    (direction: "left" | "right" | "down") => {
      if (!currentPiece || gameOver || isPaused) return

      const offset = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        down: { x: 0, y: 1 },
      }[direction]

      if (!checkCollision(currentPiece, board, offset)) {
        setCurrentPiece((prev) =>
          prev
            ? {
                ...prev,
                position: {
                  x: prev.position.x + offset.x,
                  y: prev.position.y + offset.y,
                },
              }
            : null,
        )
      } else if (direction === "down") {
        const newBoard = placePiece(currentPiece, board)
        const { board: clearedBoard, clearedLines } = clearLines(newBoard)

        setBoard(clearedBoard)
        setScore((prev) => prev + clearedLines * 100 * level + 10)
        setLines((prev) => prev + clearedLines)
        setLevel((prev) => Math.floor((lines + clearedLines) / 10) + 1)

        // Check game over
        if (currentPiece.position.y <= 1) {
          setGameOver(true)
          setIsPlaying(false)
          return
        }

        setCurrentPiece(nextPiece)
        setNextPiece(generatePiece())
      }
    },
    [
      currentPiece,
      board,
      gameOver,
      isPaused,
      checkCollision,
      placePiece,
      clearLines,
      level,
      lines,
      nextPiece,
      generatePiece,
    ],
  )

  // Rotate current piece
  const handleRotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    const rotated = rotatePiece(currentPiece)
    if (!checkCollision(rotated, board)) {
      setCurrentPiece(rotated)
    }
  }, [currentPiece, gameOver, isPaused, rotatePiece, checkCollision, board])

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    let dropDistance = 0
    while (!checkCollision(currentPiece, board, { x: 0, y: dropDistance + 1 })) {
      dropDistance++
    }

    setCurrentPiece((prev) =>
      prev
        ? {
            ...prev,
            position: {
              ...prev.position,
              y: prev.position.y + dropDistance,
            },
          }
        : null,
    )

    setScore((prev) => prev + dropDistance * 2)
  }, [currentPiece, gameOver, isPaused, checkCollision, board])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          movePiece("left")
          break
        case "ArrowRight":
          e.preventDefault()
          movePiece("right")
          break
        case "ArrowDown":
          e.preventDefault()
          movePiece("down")
          break
        case "ArrowUp":
        case " ":
          e.preventDefault()
          handleRotate()
          break
        case "Enter":
          e.preventDefault()
          hardDrop()
          break
        case "p":
        case "P":
          e.preventDefault()
          setIsPaused((prev) => !prev)
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isPlaying, gameOver, movePiece, handleRotate, hardDrop])

  // Game loop
  useEffect(() => {
    if (isPlaying && !gameOver && !isPaused) {
      dropTimeRef.current = Math.max(100, 1000 - (level - 1) * 100)

      gameLoopRef.current = setInterval(() => {
        movePiece("down")
      }, dropTimeRef.current)
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [isPlaying, gameOver, isPaused, level, movePiece])

  // Start game
  const startGame = useCallback(() => {
    const newBoard = Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null))
    const firstPiece = generatePiece()
    const secondPiece = generatePiece()

    setBoard(newBoard)
    setCurrentPiece(firstPiece)
    setNextPiece(secondPiece)
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPlaying(true)
    setIsPaused(false)
  }, [generatePiece])

  // Render board with current piece
  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row])

    // Add current piece to display board
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.position.y + y
            const boardX = currentPiece.position.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className={`w-6 h-6 border border-border/20 ${cell || "bg-card"} ${cell ? "tetris-drop" : ""}`}
          />
        ))}
      </div>
    ))
  }

  // Render next piece preview
  const renderNextPiece = () => {
    if (!nextPiece) return null

    return (
      <div className="grid gap-0.5 p-2">
        {nextPiece.shape.map((row, y) => (
          <div key={y} className="flex gap-0.5">
            {row.map((cell, x) => (
              <div key={x} className={`w-4 h-4 ${cell ? nextPiece.color : "bg-transparent"}`} />
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <Link href="/games">
        <div className="flex items-center gap-6">
          <ArrowLeft /> Back to Games
        </div>
      </Link>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Tetris</h1>
          <p className="text-muted-foreground">
            Use arrow keys to move, up arrow or space to rotate, enter for hard drop
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
          {/* Game Board */}
          <Card className="p-4 bg-card">
            <div className="border-2 border-border bg-card p-2">{renderBoard()}</div>
          </Card>

          {/* Game Info */}
          <div className="flex flex-col gap-4">
            {/* Score */}
            <Card className="p-4 min-w-48">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="text-2xl font-bold">{score.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Lines: {lines}</div>
                <div className="text-sm text-muted-foreground">Level: {level}</div>
              </div>
            </Card>

            {/* Next Piece */}
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Next</div>
              <div className="flex justify-center">{renderNextPiece()}</div>
            </Card>

            {/* Controls */}
            <Card className="p-4">
              <div className="space-y-3">
                {!isPlaying ? (
                  <Button onClick={startGame} className="w-full">
                    <Play className="w-4 h-4 mr-2" />
                    {gameOver ? "New Game" : "Start Game"}
                  </Button>
                ) : (
                  <Button onClick={() => setIsPaused(!isPaused)} variant="outline" className="w-full">
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    )}
                  </Button>
                )}

                {gameOver && <div className="text-center text-destructive font-semibold">Game Over!</div>}

                {isPaused && isPlaying && <div className="text-center text-muted-foreground">Paused</div>}
              </div>
            </Card>

            {/* Mobile Controls */}
            <Card className="p-4 lg:hidden">
              <div className="text-sm text-muted-foreground mb-3">Touch Controls</div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onTouchStart={() => movePiece("left")} className="aspect-square">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onTouchStart={handleRotate}
                  className="aspect-square bg-transparent"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onTouchStart={() => movePiece("right")} className="aspect-square">
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <div></div>
                <Button variant="outline" size="sm" onTouchStart={() => movePiece("down")} className="aspect-square">
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onTouchStart={hardDrop}
                  className="aspect-square text-xs bg-transparent"
                >
                  Drop
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
