import { type Plugin, type PluginInput, tool } from "@opencode-ai/plugin";
import { setSessionTitle } from "./tools";
import { PluginContext, type LogLevel } from "./types";
import { sessionIdleHandler } from "./handlers";
import { loadConfig } from "./config";

export const SessionTitlePlugin: Plugin = async (input: PluginInput) => {
  const service = "opencode-plugin-session-title";
  const log = (level: LogLevel, message: string) => {
    input.client.app.log({ body: { service, level, message } });
  };
  const config = loadConfig(input, log);
  const ctx = new PluginContext(
    service,
    config,
    input.client.app,
    input.client.session,
  );

  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        sessionIdleHandler(event, ctx);
      }
    },
    tool: {
      setsessiontitle: tool({
        description: "Sets the session title",
        args: { title: tool.schema.string() },
        execute({ title }, { sessionID }) {
          return setSessionTitle(title, sessionID, ctx);
        },
      }),
    },
  };
};
