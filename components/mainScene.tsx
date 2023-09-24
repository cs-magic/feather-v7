import { Cameras, GameObjects, Scene } from "phaser";

export class MainScene extends Scene {
  private helloLabel!: GameObjects.Text;
  private camera!: Cameras.Scene2D.Camera;
  private tick = 0;

  public triggerTimer?: Phaser.Time.TimerEvent;
  public w = 0;
  public h = 0;

  init() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor("#24252A");

    this.initSceneDimension();
    this.handleMouseMove();
    this.handleTimer();
    this.handleShoot();
  }

  preload() {
    this.load.image("feather", "/image/feather.png");
  }

  create() {
    // 设置底部，就不需要设置world的墙壁了，否则左右的墙会让羽毛撞斜
    this.initSceneGround();
    this.initFeatherAdd();
    this.initFeatherCollision();
  }

  update(time, delta) {
    this.tick++;
    const fps = Math.round((1000 / delta) * 10) / 10;
    // console.log({time, delta, tick: this.tick, fps})
  }

  private initSceneDimension() {
    const { width, height } = this.sys.game.canvas;
    console.log({ width, height });
    this.w = width;
    this.h = height;
  }

  private initSceneGround = () => {
    const groundHeight = Math.ceil(this.h * 0.05);

    const rect = this.add.rectangle(
      this.w / 2,
      this.h - groundHeight,
      this.w,
      2 * groundHeight,
      0xaaaaaa,
      1
    );
    this.matter.add.gameObject(rect, {
      isStatic: true,
    });
  };

  private initFeatherCollision() {
    this.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
      // console.log("collisionstart", event, bodyA, bodyB);
      // 第一个可能为空
      if (!bodyA.gameObject || !bodyB.gameObject) return;

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
      });
    });
  }

  private initFeatherAdd() {
    const addFeather = () => {
      console.log("addFeather");
      const x = Math.random() * this.w;
      const f = this.matter.add.sprite(x, 0, "feather");
      // 羽毛原图太高了，弄扁一点
      f.setScale(1, 0.5);
      f.setBounce(0); // 几乎没有弹性
      f.addListener("onClick", () => {
        console.log(f.body.position);
      });

      // f.setScale(1, .2ow)
    };

    // 不能写在 constructor 里，因为 this.time = undefined
    this.triggerTimer = this.time.addEvent({
      callback: addFeather,
      callbackScope: this,
      delay: 3 * 1000, // 3s
      loop: true,
    });
  }

  private handleMouseMove() {
    this.input.on(
      "pointermove",
      (pointer) => {
        const x = pointer.worldX;
        const y = pointer.worldY;
        // console.log("pointdown", { x, y });

        this.matter.world.getAllBodies().forEach((body) => {
          // ref: https://github.com/photonstorm/phaser3-examples/blob/master/public/src/physics/matterjs/is%20point%20within%20body.js
          if (this.matter.containsPoint(body, x, y))
            console.log("You clicked a Matter body", body.position);
        });
      },
      this
    );
  }

  private handleTimer() {
    const PauseKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.P
    );
    PauseKey.on("down", () => {
      this.triggerTimer!.paused = !this.triggerTimer!.paused;
    });
  }

  private handleShoot() {
    // Add the space key to the input manager
    const spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    spaceKey.on("down", () => {
      console.log("Space key pressed");

      // Create a rectangle body

      // A helper function to apply a force from a specific position

      const applySectorForce = (center, radius, theta, force) => {
        // For all bodies in the world

        this.matter.world.getAllBodies().forEach((body) => {
          // Calculate the angle and distance from the center
          console.log({ body });

          const { position } = body;
          const { x: cx, y: cy } = center;
          const { x: px, y: py } = position;
          const dx = px - cx;
          const dy = cy - py;

          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx); // 与x轴正轴夹角

          if (distance <= radius && Math.abs(Math.PI / 2 - angle) < theta) {
            // Apply the force to the body
            console.log({
              cx,
              cy,
              px,
              py,
              dx,
              dy,
              radius,
              theta,
              distance,
              angle,
            });
            // 当羽毛倾斜的时候，飞的贼快，也不知道为啥！
            this.matter.applyForceFromAngle(body, 0.1, -angle);

            // this.matter.(body, center, force);
          }
        });
      };

      applySectorForce(
        { x: this.w / 2, y: this.h },
        (this.h * 3) / 4,
        Math.PI / 6, // y轴为中心的左右30度内的扇形
        0.1
      );
    });
  }
}
