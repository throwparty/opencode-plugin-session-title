import type { OpencodeClient } from "@opencode-ai/sdk";
import type { Config } from "./config";

export type LogLevel = "debug" | "info" | "warn" | "error";

export class PluginContext {
  service: string;
  appClient: OpencodeClient["app"];
  sessionClient: OpencodeClient["session"];
  config: Config;
  private _idleCounts = new Map<string, number>();

  constructor(
    service: string,
    config: Config,
    appClient: OpencodeClient["app"],
    sessionClient: OpencodeClient["session"],
  ) {
    this.service = service;
    this.config = config;
    this.appClient = appClient;
    this.sessionClient = sessionClient;
  }

  incrementIdleCount(sessionId: string): boolean {
    const count = (this._idleCounts.get(sessionId) ?? 0) + 1;
    this._idleCounts.set(sessionId, count);
    return count % this.config.updateFreq === 0;
  }

  log(level: LogLevel, message: string): void {
    this.appClient.log({
      body: {
        service: this.service,
        level,
        message,
      },
    });
  }
}
