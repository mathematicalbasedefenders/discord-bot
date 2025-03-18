import {
  CanvasRenderingContext2D,
  createCanvas,
  loadImage,
  registerFont
} from "canvas";
import fs from "fs";
import path from "path";
import { log } from "../log";

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

const SPACING = 32;

const SECTION_BOX_HEIGHT = 200;
const SECTION_BOX_WIDTH = CANVAS_WIDTH - 2 * SPACING;

const NOTO_SANS_24 = "24px Noto Sans";
const NOTO_SANS_72 = "72px Noto Sans";

const BLACK = "#000000";

const DEFAULT_AVATAR = __dirname + "/assets/default-avatar.png";
const AVATAR_WIDTH = 256;
const AVATAR_HEIGHT = 256;

async function getUserStatisticsCanvas(data: any) {
  const fileID = `${data.username}-${Date.now()}`;
  const fileName = path.join(
    __dirname,
    "..",
    "..",
    `/image-outputs/${fileID}.png`
  );
  await createUserStatisticsCanvas(data, fileName);
  return fileName;
}

async function createUserStatisticsCanvas(data: unknown, fileName: string) {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  const ctx = canvas.getContext("2d");
  registerFont(__dirname + "/assets/NotoSans-Regular.ttf", {
    family: "Noto Sans"
  });

  createBackground(ctx);

  console.log(DEFAULT_AVATAR);

  /** Insert avatar here. */
  const defaultAvatar = await loadImage(DEFAULT_AVATAR);
  ctx.drawImage(defaultAvatar, SPACING, SPACING, AVATAR_WIDTH, AVATAR_HEIGHT);

  /** Insert rank here. */

  /** Insert username here.
   * TODO: Colored names for ranks
   */
  writeText(ctx, {
    text: JSON.stringify(data),
    font: NOTO_SANS_72,
    color: BLACK,
    x: SPACING * 2 + AVATAR_WIDTH,
    y: AVATAR_HEIGHT / 2
  });

  /** Insert general info here. */
  writeText(ctx, {
    text: getInformationText(data),
    font: NOTO_SANS_24,
    color: BLACK,
    x: SPACING * 2 + AVATAR_WIDTH,
    y: AVATAR_HEIGHT / 2 + 72 + SPACING
  });

  fs.writeFileSync(fileName, canvas.toBuffer());
  log.info(`Wrote file to ${fileName}`);
}

function createBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
