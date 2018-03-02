open Mnstr.Utils;

[@bs.module] external parseDbUrl : string => 'a = "parse-database-url";

[@bs.module "dotenv"] external config : {. "silent": bool} => unit = "config";

/* Load environment variables from a .env file if it exists */
config({"silent": true});

let getEnvVar = (key, fallback) =>
  Js.Option.getWithDefault(fallback, Js.Dict.get(Node.Process.process##env, key));

module Database = {
  let url = getEnvVar("DATABASE_URL", "postgres://trailmap:trailmap@localhost:5432/trailmap");
  let config = parseDbUrl(url);
  let name = config##database;
  let username = config##user;
  let password = config##password;
  let hostname = config##host;
  let hosts = config##hosts; /* TODO: Handle for config##hosts */
  let port = config##port;
  let poolMin = Text.parseInt(getEnvVar("DATABASE_POOL_MIN", "0"));
  let poolMax = Text.parseInt(getEnvVar("DATABASE_POOL_MAX", "10"));
  let poolIdle = Text.parseInt(getEnvVar("DATABASE_POOL_IDLE", "10000"));
};

module Server = {
  let port = Text.parseInt(getEnvVar("PORT", "4000"));
  let bodyLimit = "100kb";
  let corsHeaders = [|"Link"|];
  let isDev = getEnvVar("NODE_ENV", "production") === "development";
};
