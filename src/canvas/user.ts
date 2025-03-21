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
import { formatDate, formatFooterDate } from "../utilities/date-formatting";
import { getLevel } from "../utilities/level";
import { millisecondsToTime } from "../utilities/time-formatting";
import { getRank } from "../utilities/rank";

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

/**
 * `SPACING` for non-text "margins"
 * `PADDING` for text "margins"
 */
const SPACING = 32;
const HORIZONTAL_PADDING = 8;
const VERTICAL_PADDING = 4;

const SECTION_BOX_HEIGHT = 200;
const SECTION_BOX_WIDTH = CANVAS_WIDTH - 2 * SPACING;

const NOTO_SANS_16 = "16px Noto Sans";
const NOTO_SANS_20 = "20px Noto Sans";
const NOTO_SANS_24 = "24px Noto Sans";
const NOTO_SANS_48 = "48px Noto Sans";
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

  /** Insert avatar here. */
  const defaultAvatar = await loadImage(DEFAULT_AVATAR);
  ctx.drawImage(defaultAvatar, SPACING, SPACING, AVATAR_WIDTH, AVATAR_HEIGHT);

  /** Insert rank here. */
  const rank = getRank(data);
  const nameColor = rank.color === "#eeeeee" ? "#000000" : rank.color;
  createRankBox(ctx, rank, SPACING * 2 + AVATAR_WIDTH, SPACING);

  /** Insert username here. */
  writeText(ctx, {
    text: data.username,
    font: NOTO_SANS_72,
    color: nameColor,
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
  writeStandardSingleplayerData(ctx, data);

  /** Insert Easy Singleplayer info here. */
  writeEasySingleplayerData(ctx, data);

  /** Insert Multiplier info here. */
  writeMultiplayerData(ctx, data);

  /** Insert footer here. */
  createFooter(ctx, Date.now());

  fs.writeFileSync(fileName, canvas.toBuffer());
  log.info(`Wrote file to ${fileName}`);
}

// TODO: Account for global rank
function writeStandardSingleplayerData(
  ctx: CanvasRenderingContext2D,
  data: UserInterface
) {
  createBox(ctx, SPACING, AVATAR_HEIGHT + 2 * SPACING);
  writeText(ctx, {
    text: "Standard Singleplayer",
    font: NOTO_SANS_24,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y: AVATAR_HEIGHT + 2 * SPACING + VERTICAL_PADDING + 24
  });
  if (
    data.statistics.personalBestScoreOnStandardSingleplayerMode.score ===
      null ||
    data.statistics.personalBestScoreOnStandardSingleplayerMode.score ===
      undefined
  ) {
    writeText(ctx, {
      text: `(never played)`,
      font: NOTO_SANS_72,
      color: BLACK,
      x: SPACING + HORIZONTAL_PADDING,
      y: AVATAR_HEIGHT + 2 * SPACING + 2 * VERTICAL_PADDING + 90
    });
    return;
  }
  // score
  const scoreText =
    data.statistics.personalBestScoreOnStandardSingleplayerMode.score
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  writeText(ctx, {
    text: scoreText,
    font: NOTO_SANS_72,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y: AVATAR_HEIGHT + 2 * SPACING + 2 * VERTICAL_PADDING + 90
  });
  // rank badge
  if (
    typeof data.statistics.personalBestScoreOnStandardSingleplayerMode
      .globalRank === "number" &&
    data.statistics.personalBestScoreOnStandardSingleplayerMode.globalRank < 100
  ) {
    const textMetrics = ctx.measureText(scoreText);
    createGlobalRankBox(
      ctx,
      data.statistics.personalBestScoreOnStandardSingleplayerMode.globalRank,
      SPACING + HORIZONTAL_PADDING * 3 + textMetrics.actualBoundingBoxRight,
      AVATAR_HEIGHT + 2 * SPACING + 2 * VERTICAL_PADDING + 27
    );
  }
  // detailed stats labellers
  writeText(ctx, {
    text: "Enemies Killed",
    font: NOTO_SANS_20,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y: AVATAR_HEIGHT + 2 * SPACING + 3 * VERTICAL_PADDING + 120
  });
  writeText(ctx, {
    text: "Speed",
    font: NOTO_SANS_20,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y: AVATAR_HEIGHT + 2 * SPACING + 3 * VERTICAL_PADDING + 148
  });
  writeText(ctx, {
    text: "Time Elapsed",
    font: NOTO_SANS_20,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y: AVATAR_HEIGHT + 2 * SPACING + 3 * VERTICAL_PADDING + 176
  });
  // detailed stats values
  /**
   * Since `right` alignment applies to the whole text, I have do each separately. :(
   */
  writeText(ctx, {
    text: getSingleplayerGameDataText(data, "standard").enemies,
    font: NOTO_SANS_20,
    color: BLACK,
    x: CANVAS_WIDTH - SPACING - HORIZONTAL_PADDING,
    y: AVATAR_HEIGHT + 2 * SPACING + 3 * VERTICAL_PADDING + 120,
    alignment: "right"
  });
  writeText(ctx, {
    text: getSingleplayerGameDataText(data, "standard").speed,
    font: NOTO_SANS_20,
    color: BLACK,
    x: CANVAS_WIDTH - SPACING - HORIZONTAL_PADDING,
    y: AVATAR_HEIGHT + 2 * SPACING + 3 * VERTICAL_PADDING + 148,
    alignment: "right"
  });
  writeText(ctx, {
    text: getSingleplayerGameDataText(data, "standard").time,
    font: NOTO_SANS_20,
    color: BLACK,
    x: CANVAS_WIDTH - SPACING - HORIZONTAL_PADDING,
    y: AVATAR_HEIGHT + 2 * SPACING + 3 * VERTICAL_PADDING + 176,
    alignment: "right"
  });
}

// TODO: Account for global rank
function writeEasySingleplayerData(
  ctx: CanvasRenderingContext2D,
  data: UserInterface
) {
  createBox(ctx, SPACING, AVATAR_HEIGHT + 3 * SPACING + SECTION_BOX_HEIGHT);
  writeText(ctx, {
    text: "Easy Singleplayer",
    font: NOTO_SANS_24,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y: AVATAR_HEIGHT + 3 * SPACING + SECTION_BOX_HEIGHT + 24 + VERTICAL_PADDING
  });
  if (
    data.statistics.personalBestScoreOnEasySingleplayerMode.score === null ||
    data.statistics.personalBestScoreOnEasySingleplayerMode.score === undefined
  ) {
    // score
    writeText(ctx, {
      text: `(never played)`,
      font: NOTO_SANS_72,
      color: BLACK,
      x: SPACING + HORIZONTAL_PADDING,
      y:
        AVATAR_HEIGHT +
        3 * SPACING +
        2 * VERTICAL_PADDING +
        90 +
        SECTION_BOX_HEIGHT
    });
    return;
  }
  // score
  const scoreText =
    data.statistics.personalBestScoreOnEasySingleplayerMode.score
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  writeText(ctx, {
    text: scoreText,
    font: NOTO_SANS_72,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      3 * SPACING +
      2 * VERTICAL_PADDING +
      90 +
      SECTION_BOX_HEIGHT
  });
  // rank badge
  if (
    typeof data.statistics.personalBestScoreOnEasySingleplayerMode
      .globalRank === "number" &&
    data.statistics.personalBestScoreOnEasySingleplayerMode.globalRank < 100
  ) {
    const textMetrics = ctx.measureText(scoreText);
    createGlobalRankBox(
      ctx,
      data.statistics.personalBestScoreOnEasySingleplayerMode.globalRank,
      SPACING + HORIZONTAL_PADDING * 3 + textMetrics.actualBoundingBoxRight,
      AVATAR_HEIGHT +
        3 * SPACING +
        2 * VERTICAL_PADDING +
        SECTION_BOX_HEIGHT +
        27
    );
  }
  // detailed stats labellers
  writeText(ctx, {
    text: "Enemies Killed",
    font: NOTO_SANS_20,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      3 * SPACING +
      3 * VERTICAL_PADDING +
      120 +
      SECTION_BOX_HEIGHT
  });
  writeText(ctx, {
    text: "Speed",
    font: NOTO_SANS_20,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      3 * SPACING +
      3 * VERTICAL_PADDING +
      148 +
      SECTION_BOX_HEIGHT
  });
  writeText(ctx, {
    text: "Time Elapsed",
    font: NOTO_SANS_20,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      3 * SPACING +
      3 * VERTICAL_PADDING +
      176 +
      SECTION_BOX_HEIGHT
  });
  // detailed stats values
  /**
   * Since `right` alignment applies to the whole text, I have do each separately. :(
   */
  writeText(ctx, {
    text: getSingleplayerGameDataText(data, "easy").enemies,
    font: NOTO_SANS_20,
    color: BLACK,
    x: CANVAS_WIDTH - SPACING - HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      3 * SPACING +
      3 * VERTICAL_PADDING +
      120 +
      SECTION_BOX_HEIGHT,
    alignment: "right"
  });
  writeText(ctx, {
    text: getSingleplayerGameDataText(data, "easy").speed,
    font: NOTO_SANS_20,
    color: BLACK,
    x: CANVAS_WIDTH - SPACING - HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      3 * SPACING +
      3 * VERTICAL_PADDING +
      148 +
      SECTION_BOX_HEIGHT,
    alignment: "right"
  });
  writeText(ctx, {
    text: getSingleplayerGameDataText(data, "easy").time,
    font: NOTO_SANS_20,
    color: BLACK,
    x: CANVAS_WIDTH - SPACING - HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      3 * SPACING +
      3 * VERTICAL_PADDING +
      176 +
      SECTION_BOX_HEIGHT,
    alignment: "right"
  });
}

function writeMultiplayerData(
  ctx: CanvasRenderingContext2D,
  data: UserInterface
) {
  createBox(ctx, SPACING, AVATAR_HEIGHT + 4 * SPACING + 2 * SECTION_BOX_HEIGHT);
  writeText(ctx, {
    text: "Multiplayer",
    font: NOTO_SANS_24,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      4 * SPACING +
      2 * SECTION_BOX_HEIGHT +
      24 +
      VERTICAL_PADDING
  });
  writeText(ctx, {
    text: getMultiplayerDataText(data).winRatioText,
    font: NOTO_SANS_72,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      4 * SPACING +
      2 * VERTICAL_PADDING +
      90 +
      2 * SECTION_BOX_HEIGHT
  });
  writeText(ctx, {
    text: "Games Won",
    font: NOTO_SANS_20,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      4 * SPACING +
      4 * VERTICAL_PADDING +
      120 +
      2 * SECTION_BOX_HEIGHT
  });
  writeText(ctx, {
    text: "Games Played",
    font: NOTO_SANS_20,
    color: BLACK,
    x: SPACING + HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      4 * SPACING +
      4 * VERTICAL_PADDING +
      148 +
      2 * SECTION_BOX_HEIGHT
  });
  writeText(ctx, {
    text: getMultiplayerDataText(data).wins.toString(),
    font: NOTO_SANS_20,
    color: BLACK,
    x: CANVAS_WIDTH - SPACING - HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      4 * SPACING +
      4 * VERTICAL_PADDING +
      120 +
      2 * SECTION_BOX_HEIGHT,
    alignment: "right"
  });
  writeText(ctx, {
    text: getMultiplayerDataText(data).plays.toString(),
    font: NOTO_SANS_20,
    color: BLACK,
    x: CANVAS_WIDTH - SPACING - HORIZONTAL_PADDING,
    y:
      AVATAR_HEIGHT +
      4 * SPACING +
      4 * VERTICAL_PADDING +
      148 +
      2 * SECTION_BOX_HEIGHT,
    alignment: "right"
  });
}

function getInformationText(data: UserInterface) {
  const level = getLevel(data.statistics.totalExperiencePoints);
  const joined = formatDate(new Date(data.creationDateAndTime).toISOString());
  const toNext = (level.progressToNext * 100).toFixed(3);
  return `Level ${level.level} (${toNext}% to next)\nJoined on ${joined}.`;
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
    alignment?: CanvasTextAlign;
  }
) {
  if (!options.alignment) {
    options.alignment = "left";
  }
  ctx.fillStyle = options.color;
  ctx.font = options.font;
  ctx.textAlign = options.alignment;
  ctx.fillText(options.text, options.x, options.y);
}

function getSingleplayerGameDataText(
  data: UserInterface,
  mode: "easy" | "standard"
) {
  const statistics = data.statistics;
  let enemiesKilled = 0;
  let enemiesSpawned = 0;
  let speed = 0;
  let time = 0;
  if (mode === "easy") {
    const easyBest = statistics.personalBestScoreOnEasySingleplayerMode;
    enemiesKilled = easyBest.enemiesKilled;
    enemiesSpawned = easyBest.enemiesCreated;
    speed = (easyBest.actionsPerformed / easyBest.timeInMilliseconds) * 60000;
    time = easyBest.timeInMilliseconds;
  } else if (mode === "standard") {
    const standardBest = statistics.personalBestScoreOnStandardSingleplayerMode;
    enemiesKilled = standardBest.enemiesKilled;
    enemiesSpawned = standardBest.enemiesCreated;
    speed =
      (standardBest.actionsPerformed / standardBest.timeInMilliseconds) * 60000;
    time = standardBest.timeInMilliseconds;
  }
  const result = {
    enemies: `${enemiesKilled}`,
    speed: `${speed.toFixed(3)}APM`,
    time: `${millisecondsToTime(time)}`
  };
  return result;
}

function getMultiplayerDataText(data: UserInterface) {
  const statistics = data.statistics;
  const multiplayerWins = statistics?.multiplayer?.gamesWon;
  const multiplayerPlays = statistics?.multiplayer?.gamesPlayed;
  const winRatio =
    multiplayerPlays === 0 || typeof multiplayerPlays === "undefined"
      ? null
      : multiplayerWins / multiplayerPlays;
  const winRatioString =
    typeof winRatio === "number"
      ? `${(winRatio * 100).toFixed(3)}%`
      : "(never played)";
  const result = {
    plays: multiplayerPlays || "0",
    wins: multiplayerWins || "0",
    winRatio: winRatio || "0",
    winRatioText: winRatioString
  };
  return result;
}

function createRankBox(
  ctx: CanvasRenderingContext2D,
  rank: { [key: string]: string },
  x: number,
  y: number
) {
  // if don't have rank, don't do anything
  if (rank.title === "(No Rank)") {
    return;
  }

  const RANK_BOX_WIDTH = 256;
  const RANK_BOX_HEIGHT = 32;
  ctx.font = NOTO_SANS_24;
  ctx.fillStyle = rank.color;
  ctx.fillRect(x, y, RANK_BOX_WIDTH, RANK_BOX_HEIGHT);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(rank.title, x + RANK_BOX_WIDTH / 2, y + RANK_BOX_HEIGHT / 2);
  // set back
  ctx.textBaseline = "alphabetic";
}

function createGlobalRankBox(
  ctx: CanvasRenderingContext2D,
  rank: number,
  x: number,
  y: number
) {
  const GLOBAL_RANK_BOX_WIDTH = 128;
  const GLOBAL_RANK_BOX_HEIGHT = 72;
  const color = getGlobalRankBoxColor(rank);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, GLOBAL_RANK_BOX_WIDTH, GLOBAL_RANK_BOX_HEIGHT);
  writeText(ctx, {
    text: "Global",
    color: "#000000",
    x: x + GLOBAL_RANK_BOX_WIDTH / 2,
    y: y + VERTICAL_PADDING + 16,
    font: NOTO_SANS_16,
    alignment: "center"
  });
  writeText(ctx, {
    text: `#${rank}`,
    color: "#000000",
    x: x + GLOBAL_RANK_BOX_WIDTH / 2,
    y: y + VERTICAL_PADDING * 2 + 56,
    font: NOTO_SANS_48,
    alignment: "center"
  });
}

function getGlobalRankBoxColor(rank: number) {
  if (rank === 1) {
    return "#ffd700";
  } else if (rank === 2) {
    return "#c0c0c0";
  } else if (rank === 3) {
    return "#cd7f32";
  } else if (rank <= 10) {
    return "#8ba1ed";
  } else if (rank <= 100) {
    return "#ab93db";
  }
  // no color.
  return "#dddddd";
}

function createFooter(ctx: CanvasRenderingContext2D, date: number) {
  const FOOTER_BOX_HEIGHT = 64;
  ctx.fillStyle = "#222222";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = NOTO_SANS_20;
  ctx.fillRect(
    0,
    CANVAS_HEIGHT - FOOTER_BOX_HEIGHT,
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  );
  const dateObject = new Date(date);
  const timestampText = `Data requested on ${formatFooterDate(dateObject)}.`;
  const gameText =
    "Mathematical Base Defenders by @mistertfy64 · https://mathematicalbasedefenders.com";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(
    timestampText,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT - FOOTER_BOX_HEIGHT / 2 - 3 * VERTICAL_PADDING
  );
  ctx.fillText(
    gameText,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT - FOOTER_BOX_HEIGHT / 2 + 3 * VERTICAL_PADDING
  );
}

export { getUserStatisticsCanvas };
