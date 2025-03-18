import {
  CanvasRenderingContext2D,
  createCanvas,
  loadImage,
  registerFont
} from "canvas";
import fs from "fs";
import path from "path";
import { log } from "../log";

const WIDTH = 1080;
const HEIGHT = 1080;

const DEFAULT_AVATAR = __dirname + "/assets/default-avatar.png";

function getUserStatisticsCanvas(data: any) {
  const fileID = `${data.username}-${Date.now()}`;
  const fileName = path.join(
    __dirname,
    "..",
    "..",
    `/image-outputs/${fileID}.png`
  );
  createUserStatisticsCanvas(data, fileName);
  return fileName;
}

function createUserStatisticsCanvas(data: unknown, fileName: string) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");
  registerFont(__dirname + "/assets/NotoSans-Regular.ttf", {
    family: "Noto Sans"
  });

  const NOTO_SANS_24 = "24px Noto Sans";
  const BLACK = "#000000";

  createBackground(ctx);

  /** Insert avatar here. */
  loadImage(DEFAULT_AVATAR).then((defaultAvatar) => {
    ctx.drawImage(defaultAvatar, 32, 32, 256, 256);
  });

  writeText(ctx, {
    text: JSON.stringify(data),
    font: NOTO_SANS_24,
    color: BLACK,
    x: 500,
    y: 500
  });

  fs.writeFileSync(fileName, canvas.toBuffer());
  log.info(`Wrote file to ${fileName}`);
}

function createBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function writeText(
  ctx: CanvasRenderingContext2D,
  options: {
    text: string;
    font: string;
    color: string;
    x: number;
    y: number;
  }
) {
  ctx.fillStyle = options.color;
  ctx.font = options.font;
  ctx.fillText(options.text, options.x, options.y);
}

export { getUserStatisticsCanvas };
