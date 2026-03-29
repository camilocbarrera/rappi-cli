import Table from "cli-table3";
import { dim, bold, rappiOrangeBold } from "./chalk";

const NO_BORDERS = {
  top: "", "top-mid": "", "top-left": "", "top-right": "",
  bottom: "", "bottom-mid": "", "bottom-left": "", "bottom-right": "",
  left: "  ", "left-mid": "", mid: "", "mid-mid": "",
  right: "", "right-mid": "",
  middle: "  ",
};

const TABLE_STYLE = {
  head: [] as string[], border: [] as string[],
  "padding-left": 0, "padding-right": 1,
};

export function printTable(opts: {
  title?: string;
  head: string[];
  rows: (string | number | null | undefined)[][];
}) {
  if (opts.title) console.log(`\n  ${rappiOrangeBold(opts.title)}\n`);

  const table = new Table({
    head: opts.head.map((h) => dim(h)),
    chars: NO_BORDERS,
    style: TABLE_STYLE,
  });

  for (const row of opts.rows) {
    table.push(row.map((v) => (v == null || v === "" ? dim("--") : String(v))));
  }

  console.log(table.toString());
}

export function printDetail(title: string, pairs: [string, string | null | undefined][]) {
  console.log(`\n  ${bold(title)}\n`);

  const maxLen = Math.max(...pairs.map(([k]) => k.length));
  for (const [key, val] of pairs) {
    const label = dim(key.padEnd(maxLen + 2));
    const value = val == null || val === "" ? dim("--") : val;
    console.log(`  ${label}${value}`);
  }
  console.log();
}
