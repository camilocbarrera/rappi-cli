import { rappiOrange, dim } from "./chalk";

const ASCII = `
  ██████  ███████ ██████  ██████  ███████         ███████ ██      ███████
  ██   ██ ██   ██ ██   ██ ██   ██   ███           ██      ██        ███
  ██████  ███████ ██████  ██████    ███           ██      ██        ███
  ██  ██  ██   ██ ██      ██        ███           ██      ██        ███
  ██   ██ ██   ██ ██      ██      ███████         ███████ ███████ ███████`;

export function printBanner(version?: string) {
  console.log(rappiOrange(ASCII));
  if (version) console.log(`\n  ${dim(`v${version}  ·  Order from Rappi via the terminal`)}`);
  console.log();
}
