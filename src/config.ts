import type { PluginInput } from "@opencode-ai/plugin";
import type { LogLevel } from "./types";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse as parseJsonc } from "jsonc-parser";

const DEFAULT_CONFIG_DIR = ".config/opencode";
const CONFIG_FILENAME = "session-title.jsonc";

export interface Config {
  updateFreq: number;
  prompt: string;
}

function defaultConfig(): Config {
  return {
    updateFreq: 3,
    prompt: `You are a summarisation bot. Generate a brief (max 50 character) title for this session. Omit low-signal language.`,
  };
}

function loadConfigFile(
  path: string,
  log: (level: LogLevel, message: string) => void,
): Partial<Config> {
  log("debug", `Loading config from ${path}`);
  try {
    const content = readFileSync(path, "utf8");
    const parsed = parseJsonc(content);
    const config: Partial<Config> = {};
    if (typeof parsed?.updateFreq === "number") {
      config.updateFreq = parsed.updateFreq;
    }
    if (typeof parsed?.prompt === "string") {
      config.prompt = parsed.prompt;
    }
    log("debug", `Loaded: ${JSON.stringify(config)}`);
    return config;
  } catch (err) {
    log("debug", `Failed: ${err}`);
    return {};
  }
}

export function loadConfig(
  ctx: PluginInput,
  log: (level: LogLevel, message: string) => void,
): Config {
  const defaults = defaultConfig();

  const globalConfigDir =
    process.env.OPENCODE_CONFIG_DIR ??
    resolve(process.env.HOME ?? "~", DEFAULT_CONFIG_DIR);
  const globalConfigPath = resolve(globalConfigDir, CONFIG_FILENAME);
  const globalConfig = loadConfigFile(globalConfigPath, log);

  const projectConfigPath = resolve(ctx.directory, ".opencode", CONFIG_FILENAME);
  const projectConfig = loadConfigFile(projectConfigPath, log);

  const baseUpdateFreq = 
    projectConfig.updateFreq !== undefined ? projectConfig.updateFreq :
    globalConfig.updateFreq !== undefined ? globalConfig.updateFreq :
    defaults.updateFreq;

  const merged = {
    updateFreq: baseUpdateFreq + 1,
    prompt: projectConfig.prompt ?? globalConfig.prompt ?? defaults.prompt,
  };

  log("debug", `Final config: ${JSON.stringify(merged)}`);
  return merged;
}
