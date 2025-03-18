import { CanvasRenderingContext2D, createCanvas, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import { log } from "../log";

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
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext("2d");
  registerFont(__dirname + "/assets/NotoSans-Regular.ttf", {
    family: "Noto Sans"
  });

  const NOTO_SANS_24 = "24px Noto Sans";
  const BLACK = "#000000";

  createBackground(ctx);
  writeText(ctx, {
    text: JSON.stringify(data),
    font: NOTO_SANS_24,
    color: BLACK,
    x: 500,
    y: 500
  });

  fs.writeFileSync(fileName, canvas.toBuffer());
  log.info("Wrote file to", fileName);
}

function createBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(0, 0, 1024, 1024);
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
