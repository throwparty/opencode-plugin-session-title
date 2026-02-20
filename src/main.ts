import { type Plugin, tool } from "@opencode-ai/plugin";

// AppLogData.body.level doesn't appear to be exposed by the plugin SDK.
type LogLevel = "debug" | "info" | "warn" | "error";

export const SessionTitlePlugin: Plugin = async ({ client }) => {
  const service = "opencode-plugin-session-title";
  return {
    tool: {
      setsessiontitle: tool({
        description: "Sets the session title",
        args: { title: tool.schema.string() },
        async execute({ title }, { sessionID }) {
          const result = await client.session.update({
            path: { id: sessionID },
            body: { title },
          });

          let level: LogLevel = "info";
          let message = `Set the session title to ${result.data?.title}`;
          if (result.error) {
            level = "warn";
            message = `Failed to set the session title: ${result.error}`;
          }
          client.app.log({
            body: {
              service,
              level,
              message,
            },
          });
          return message;
        },
      }),
    },
  };
};
