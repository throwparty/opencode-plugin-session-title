import { LogLevel, PluginContext } from "./types";

export async function setSessionTitle(
  title: string,
  sessionID: string,
  { service, appClient, sessionClient }: PluginContext,
) {
  const result = await sessionClient.update({
    path: { id: sessionID },
    body: { title },
  });

  let level: LogLevel = "info";
  let message = `Set the session title to ${result.data?.title}`;
  if (result.error) {
    level = "warn";
    message = `Failed to set the session title: ${result.error}`;
  }
  appClient.log({
    body: {
      service,
      level,
      message,
    },
  });
  return message;
}
