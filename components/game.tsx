import { useRef } from "react"
import { useGame } from "../helpers/useGame"
import { Types } from "phaser"
import { MainScene } from "./mainScene"

const gameConfig: Types.Core.GameConfig = {
  width: "100%",
  height: "100%",
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
  scene: MainScene,
  fps: {
    min: 30,
    target: 60,
  },
  physics: {
    default: "matter",
    matter: {
      gravity: {
        x: 0,
        y: 0.1,
      },
      debug: process.env.NODE_ENV === "development",
    },
  },
}

// you can place this in a different file if you prefer
const PhaserGame = () => {
  const parentEl = useRef<HTMLDivElement>(null)
  useGame(gameConfig, parentEl)

  return (
    <div className="bg-cyan-500">
      <div ref={parentEl} />
    </div>
  )
}

export default PhaserGame
