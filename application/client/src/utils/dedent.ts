export function dedent(strings: TemplateStringsArray, ...values: unknown[]): string {
  const raw = String.raw({ raw: strings }, ...values);
  const lines = raw.replaceAll("\r\n", "\n").split("\n");

  while (lines.length > 0 && lines[0]!.trim() === "") {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1]!.trim() === "") {
    lines.pop();
  }

  let indent: number | null = null;
  for (const line of lines) {
    if (line.trim() === "") {
      continue;
    }

    const lineIndent = line.match(/^\s*/)?.[0].length ?? 0;
    indent = indent == null ? lineIndent : Math.min(indent, lineIndent);
  }

  if (indent == null || indent === 0) {
    return lines.join("\n");
  }

  return lines
    .map((line) => (line.trim() === "" ? "" : line.slice(indent)))
    .join("\n");
}
