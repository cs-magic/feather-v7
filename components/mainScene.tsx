import { clamp, pull } from "lodash"
import { Cameras, GameObjects, Scene } from "phaser"

export class MainScene extends Scene {
  private helloLabel!: GameObjects.Text
  private camera!: Cameras.Scene2D.Camera
  private tick = 0
  private nFeathers = 0

  public triggerTimer?: Phaser.Time.TimerEvent
  public vw = 0
  public vh = 0
  private pw = 0 // player
  private ph = 0

  private loadHadoken = false
  private player?: Phaser.GameObjects.Sprite
  private keys

  init() {
    this.camera = this.cameras.main
    this.camera.setBackgroundColor("#24252A")

    this.initSceneDimension()
  }

  preload() {
    this.load.image("feather", "/image/feather.png")

    this.load.image("gale", "/image/gale.png")

    this.load.image("bg", "/assets/skies/gradient29.png")
    this.load.image("char", "/assets/pics/nayuki.png")

    if (this.loadHadoken) {
      this.load.atlas(
        "ryu",
        "/assets/animations/sf2ryu.png",
        "/assets/animations/sf2ryu.json"
      )
      this.load.image("sea", "/assets/skies/sf2boat.png")
      this.load.image("ground", "/assets/skies/sf2floor.png")
    }
  }

  create() {
    // 设置底部，就不需要设置world的墙壁了，否则左右的墙会让羽毛撞斜
    this.initSceneGround()
    this.initFeatherAdd()
    this.initFeatherCollision()

    this.initBackground()
    this.initPlayer()

    this.handleMouseMove()
    this.handleTimer()

    this.keys = {
      A: this.input.keyboard.addKey("A"),
      W: this.input.keyboard.addKey("W"),
      S: this.input.keyboard.addKey("S"),
      D: this.input.keyboard.addKey("D"),
      UP: this.input.keyboard.addKey("UP"),
      LEFT: this.input.keyboard.addKey("LEFT"),
      RIGHT: this.input.keyboard.addKey("RIGHT"),
      DOWN: this.input.keyboard.addKey("DOWN"),
      SPACE: this.input.keyboard.addKey("SPACE"),
    }
  }

  update(time, delta) {
    this.tick++
    const fps = Math.round((1000 / delta) * 10) / 10
    // console.log({time, delta, tick: this.tick, fps})

    const step = this.vw / 100
    if (this.keys.A.isDown || this.keys.LEFT.isDown) this.player!.x -= step
    if (this.keys.D.isDown || this.keys.RIGHT.isDown) this.player!.x += step
    if (this.keys.SPACE.isDown) this.handleShoot()

    this.updatePlayerX(this.player!.x)
  }

  private initBackground() {
    const bg = this.add.image(this.vw / 2, this.vh / 2, "bg")
    bg.setDisplaySize(this.vw, this.vh)
  }

  private updatePlayerX(x: number) {
    this.player!.x = clamp(x, this.pw / 2, this.vw - this.pw / 2)
  }

  private initPlayer() {
    this.pw = this.vw * 0.2
    this.ph = this.pw * 1.8
    const y = this.vh - this.ph / 2

    const player = this.add.sprite(this.vw / 2, y, "char")
    player.setDisplaySize(this.pw, this.ph)

    player.setInteractive({ draggable: true })
    // always on top
    player.setDepth(9999)

    player.on("drag", (pointer, dragX, dragY) => {
      console.log({ dragX, dragY })
      this.updatePlayerX(dragX)
    })
    this.player = player
  }

  private hadoken() {
    this.add.image(100, 130, "sea").setScale(3)
    this.add.image(400, 500, "ground").setScale(3)

    var info = ["Click to toggle Animation.yoyo", "yoyo: true"]
    var text = this.add
      .text(400, 32, info, { color: "#113355", align: "center" })
      .setOrigin(0.5, 0)

    this.anims.create({
      key: "hadoken",
      frames: this.anims.generateFrameNames("ryu", {
        prefix: "frame_",
        end: 15,
        zeroPad: 2,
      }),
      yoyo: true,
      repeat: -1,
      // duration: 2000,
    })

    const sprite = this.add.sprite(400, 350, "feather")
    console.log({ sprite })
    var ryu = sprite.play("hadoken").setScale(3)

    this.input.on("pointerup", function () {
      //  Toggle 'yoyo' at runtime
      ryu.anims.yoyo = !ryu.anims.yoyo

      info[1] = "yoyo: " + ryu.anims.yoyo

      text.setText(info)
    })
  }

  private drawSectorAnim() {
    var centerX = this.player?.x
    var centerY = this.vh
    var radius = (this.vh * 3) / 4

    const getGraphics = (t: "graphics" | "gale") => {
      let graphics
      if (t === "graphics") {
        graphics = this.add.graphics({
          fillStyle: { color: 0xaa0000, alpha: 0.3 },
        })

        var startAngle = Phaser.Math.DegToRad(-120)
        var endAngle = Phaser.Math.DegToRad(-60)
        graphics.beginPath()
        graphics.moveTo(centerX, centerY)
        graphics.arc(centerX, centerY, radius, startAngle, endAngle, false)
        graphics.closePath()
        graphics.fillPath()
      } else {
        graphics = this.add
          .sprite(this.player!.x, (this.vh * 5) / 8, "gale")
          .setDisplaySize(
            (this.vh * 3) / 4,
            ((this.vh * 3) / 4 / 2) * Math.sqrt(3) * 1.5
          )
      }
      return graphics
    }

    const graphics = getGraphics("gale")

    var mask = this.make.graphics({})
    mask.fillStyle(0xffffff)
    mask.fillCircle(this.player!.x, centerY, 1)

    graphics.mask = new Phaser.Display.Masks.GeometryMask(this, mask)

    var maskRadius = { value: 0 }
    this.tweens.add({
      targets: maskRadius,
      value: radius,
      duration: 300,
      ease: Phaser.Math.Easing.Expo.Out,
      repeat: 0,
      yoyo: false,
      callbackScope: this,
      onUpdate: (tween, target, param) => {
        // mask.clear()
        console.log({ target, param })
        mask.clear()
        mask.fillCircle(this.player!.x, centerY, maskRadius.value)
      },
      onComplete: () => {
        this.tweens.add({
          targets: maskRadius,
          value: 0,
          duration: 200,
          ease: Phaser.Math.Easing.Expo.Out,
          repeat: 0,
          yoyo: false,
          callbackScope: this,
          onUpdate: (tween, target, param) => {
            // mask.clear()
            console.log({ target, param })
            mask.clear()
            mask.fillCircle(this.player!.x, centerY, maskRadius.value)
          },
          onComplete: () => {
            // graphics.destroy()
          },
        })
      },
    })
  }

  private initSceneDimension() {
    const { width, height } = this.sys.game.canvas
    console.log({ width, height })
    this.vw = width
    this.vh = height
  }

  private initSceneGround = () => {
    const groundHeight = Math.ceil(this.vh * 0.05)

    const rect = this.add.rectangle(
      this.vw / 2,
      this.vh - groundHeight,
      this.vw,
      2 * groundHeight,
      0xaaaaaa,
      1
    )
    this.matter.add.gameObject(rect, {
      isStatic: true,
    })
  }

  private initFeatherCollision() {
    this.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
      // console.log("collisionstart", event, bodyA, bodyB);
      // 第一个可能为空
      if (!bodyA.gameObject || !bodyB.gameObject) return

      this.tweens.add({
        // 要基于内部的 gameObject
        targets: bodyB.gameObject,
        // 羽毛掉到地上就变扁
        // todo: 可以基于羽毛的实际形状吗，而非矩形？
        scaleY: 0.1,

        ease: "Linear", // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 1000,
        repeat: 0, // repeat forever
        yoyo: false,
        callbackScope: this,
      })
    })
  }

  private initFeatherAdd() {
    const addFeather = () => {
      this.nFeathers++
      console.log("addFeather")
      const x = Math.random() * this.vw
      const f = this.matter.add.sprite(x, 0, "feather")
      // 羽毛原图太高了，弄扁一点
      f.setScale(1, 0.5)
      f.setBounce(0) // 几乎没有弹性
      f.addListener("onClick", () => {
        console.log(f.body.position)
      })

      // f.setScale(1, .2ow)
      if (this.nFeathers >= 79) {
        this.triggerTimer!.destroy()
      }
    }

    // 不能写在 constructor 里，因为 this.time = undefined
    this.triggerTimer = this.time.addEvent({
      callback: addFeather,
      callbackScope: this,
      delay: 3 * 1000, // 3s
      loop: true,
    })
  }

  private handleMouseMove() {
    // this.input.keyboard
    //   .addKey(Phaser.Input.Keyboard.KeyCodes.A)
    //   .on("down", () => {
    //     console.log("down A")
    //     if (this.player) this.player.x -= 10
    //   })

    this.input.on(
      "pointermove",
      (pointer) => {
        const x = pointer.worldX
        const y = pointer.worldY
        // console.log("pointdown", { x, y });

        this.matter.world.getAllBodies().forEach((body) => {
          // ref: https://github.com/photonstorm/phaser3-examples/blob/master/public/src/physics/matterjs/is%20point%20within%20body.js
          if (this.matter.containsPoint(body, x, y))
            console.log("You clicked a Matter body", body.position)
        })
      },
      this
    )
  }

  private handleTimer() {
    const PauseKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.P
    )
    PauseKey.on("down", () => {
      this.triggerTimer!.paused = !this.triggerTimer!.paused
    })
  }

  private handleShoot() {
    this.drawSectorAnim()

    // A helper function to apply a force from a specific position
    const applySectorForce = (center, radius, theta, force) => {
      // For all bodies in the world

      this.matter.world.getAllBodies().forEach((body) => {
        // Calculate the angle and distance from the center
        console.log({ body })

        const { position } = body
        const { x: cx, y: cy } = center
        const { x: px, y: py } = position
        const dx = px - cx
        const dy = cy - py

        const distance = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx) // 与x轴正轴夹角

        if (distance <= radius && Math.abs(Math.PI / 2 - angle) < theta) {
          // Apply the force to the body
          // console.log({cx, cy, px, py, dx, dy, radius, theta, distance, angle,})
          // 当羽毛倾斜的时候，飞的贼快，也不知道为啥！
          this.matter.applyForceFromAngle(body, 0.1, -angle)

          // this.matter.(body, center, force);
        }
      })
    }

    applySectorForce(
      { x: this.player?.x, y: this.vh },
      (this.vh * 3) / 4,
      Math.PI / 6, // y轴为中心的左右30度内的扇形
      0.1
    )
  }
}
