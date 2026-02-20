import type { EventSessionIdle } from "@opencode-ai/sdk";
import { PluginContext } from "./types";
import { setSessionTitle } from "./tools";

async function isSubagentSession(sessionId: string, ctx: PluginContext) {
  const result = await ctx.sessionClient.get({ path: { id: sessionId } });
  return !!result.data?.parentID;
}

async function retitleSession(sessionId: string, ctx: PluginContext) {
  const promptResult = await ctx.sessionClient.prompt({
    path: { id: sessionId },
    body: {
      tools: {
        "*": false,
        setsessiontitle: true,
      },
      parts: [{ type: "text", text: ctx.config.prompt }],
    },
  });

  if (promptResult.error) {
    ctx.log("warn", `Failed to generate title: ${promptResult.error}`);
    return;
  }

  const title =
    promptResult.data?.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text.trim())
      .filter(Boolean)
      .join(" ")
      .trim() ?? "";

  if (!title) {
    ctx.log("warn", "Generated empty title");
    return;
  }

  await setSessionTitle(title, sessionId, ctx);
}

export async function sessionIdleHandler(
  event: EventSessionIdle,
  ctx: PluginContext,
) {
  const sessionId = event.properties.sessionID;

  const shouldRetitle = ctx.incrementIdleCount(sessionId);
  if (!shouldRetitle) {
    return;
  }

  const isSubagent = await isSubagentSession(sessionId, ctx);
  if (isSubagent) {
    ctx.log("debug", "Skipping retitle for sub-agent session");
    return;
  }

  await retitleSession(sessionId, ctx);
}
