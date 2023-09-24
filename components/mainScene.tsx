import { Cameras, GameObjects, Scene } from "phaser";

function resizeFeather(context: Scene, obj: Phaser.Physics.Matter.Sprite) {
  context.tweens.add({
    targets: obj,

    scaleX: 1, // scale horizontally by 200%

    scaleY: 0.1, // scale vertically by 200%

    ease: "Linear", // 'Cubic', 'Elastic', 'Bounce', 'Back'

    duration: 1000,

    repeat: 0, // repeat forever

    yoyo: false,
  });
}

export class MainScene extends Scene {
  private helloLabel!: GameObjects.Text;
  private camera!: Cameras.Scene2D.Camera;
  private tick = 0;
  private triggerTimer?: Phaser.Time.TimerEvent;
  private w = 0;
  private h = 0;

  preload() {
    this.load.image("feather", "/image/feather.png");
  }

  init() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor("#24252A");

    this.matter.world.setBounds();

    const { width, height } = this.sys.game.canvas;
    this.w = width;
    this.h = height;
    const groundHeight = this.h * 0.1;

    const rect = this.add.rectangle(
      this.w / 2,
      this.h - groundHeight,
      this.w,
      groundHeight,
      0xaaaaaa,
      1
    );

    this.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
      console.log("collisionstart", event, bodyA, bodyB);
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

    this.matter.add.gameObject(rect, {
      isStatic: true,
    });

    // 不能写在 constructor 里，因为 this.time = undefined
    this.triggerTimer = this.time.addEvent({
      callback: this.addFeather,
      callbackScope: this,
      delay: 3 * 1000, // 3s
      loop: true,
    });
  }

  create() {
    const { centerX, centerY } = this.camera;

    // this.helloLabel = this.add
    //   .text(centerX, centerY, "NextJs Phaser", {
    //     fontSize: "40px",
    //   })
    //   .setShadow(5, 5, "#5588EE", 0, true, true)
    //   .setOrigin(0.5, 0.5);
  }

  update(time, delta) {
    this.tick++;
    const fps = Math.round((1000 / delta) * 10) / 10;
    // console.log({time, delta, tick: this.tick, fps})

    // this.helloLabel.angle += 0.1;
  }

  addFeather() {
    console.log("addFeather");
    const { width, height } = this.sys.game.canvas;
    const x = Math.random() * width;
    const f = this.matter.add.sprite(x, 0, "feather");
    f.setOrigin(0.5, 0.5);
    f.setScale(1, 0.5);

    // f.setScale(1, .2ow)
  }
}
