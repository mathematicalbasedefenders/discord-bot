import {
  CanvasRenderingContext2D,
  createCanvas,
  loadImage,
  registerFont
} from "canvas";
import fs from "fs";
import path from "path";
import { log } from "../log";
import { UserInterface } from "../models/User";

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

const SPACING = 32;

const SECTION_BOX_HEIGHT = 200;
const SECTION_BOX_WIDTH = CANVAS_WIDTH - 2 * SPACING;

const NOTO_SANS_24 = "24px Noto Sans";
const NOTO_SANS_72 = "72px Noto Sans";

const BLACK = "#000000";
const BOX_COLOR = "#dddddd";
const BACKGROUND_COLOR = "#eeeeee";

const DEFAULT_AVATAR = __dirname + "/assets/default-avatar.png";
const AVATAR_WIDTH = 256;
const AVATAR_HEIGHT = 256;

const LINE_SPACING_COEFFICIENT = 1.25;

async function getUserStatisticsCanvas(data: UserInterface) {
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

async function createUserStatisticsCanvas(
  data: UserInterface,
  fileName: string
) {
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
    text: data.username,
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
    y: AVATAR_HEIGHT / 2 + LINE_SPACING_COEFFICIENT * SPACING
  });

  /** Insert Standard Singleplayer info here. */

  /** Insert Easy Singleplayer info here. */

  /** Insert Multiplier Singleplayer info here. */

  fs.writeFileSync(fileName, canvas.toBuffer());
  log.info(`Wrote file to ${fileName}`);
}

function getInformationText(data: UserInterface) {
  const level = getLevel(data.statistics.totalExperiencePoints);
  const joined = formatDate(new Date(data.creationDateAndTime).toISOString());
  const toNext = (level.progressToNext * 100).toFixed(3);
  return `Level ${level.level} (${toNext}% to next), Joined on ${joined}.`;
}

function createBackground(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function createBox(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = BOX_COLOR;
  ctx.fillRect(x, y, SECTION_BOX_WIDTH, SECTION_BOX_HEIGHT);
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

function getLevel(experiencePoints: number | undefined) {
  if (typeof experiencePoints !== "number") {
    return {
      level: 0,
      progressToNext: 0
    };
  }
  let level = 0;
  let stock = experiencePoints;
  while (stock > 100 * 1.1 ** level) {
    stock -= 100 * 1.1 ** level;
    level++;
  }
  return {
    level: level,
    progressToNext: stock / (100 * 1.1 ** level + 1)
  };
}

function formatDate(ISODate: string) {
  const dateObject = new Date(ISODate);
  return dateObject.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

export { getUserStatisticsCanvas };
