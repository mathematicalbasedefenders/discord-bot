import fs from "fs";
import path from "path";
const rawConfig = fs.readFileSync(
  path.join(__dirname, "..", "configuration.json")
);
const configuration = JSON.parse(rawConfig.toString());
export { configuration };
