import { REST, type RESTOptions } from "discord.js";
export function makeRest(
  token: string,
  makeRequest?: RESTOptions["makeRequest"],
): REST {
  return new REST({
    version: "10",
    ...(makeRequest ? { makeRequest } : {}),
    retries: 0,
    rejectOnRateLimit: () => true,
    timeout: 10_000,
  }).setToken(token);
}
