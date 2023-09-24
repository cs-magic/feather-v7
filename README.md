# NextJs Phaser Starter Template

## notes

### 矩形填充颜色

参考：https://stackoverflow.com/a/76415661/9422455

- 正确做法
```ts
const rect = this.add.rectangle(
  this.w / 2,
  this.h - groundHeight,
  this.w,
  groundHeight,
  0xaaaaaa,
  1
);
this.matter.add.gameObject(rect, { isStatic: true });
```

- 错误做法（没有颜色）
```ts
this.ground = this.matter.add.rectangle(
  this.w / 2,
    this.h - groundHeight,
  this.w,
  groundHeight,
  { isStatic: true }
);
// 填充颜色，ref: https://stackoverflow.com/a/76415153/9422455
this.ground.render.fillColor = 0x00aa00;
this.ground.render.fillOpacity = 1;
```


## ref

### template

- git clone git@github.com:isrmicha/nextjs-phaser.git

