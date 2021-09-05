import { Graph } from "../model/modelSlice";

/** The shape of a node definition. */
const nodePattern = /^(\w+)$/;
/** The shape of an edge definition. */
const edgePattern = /^(\w+) -> (\w+)$/;

/**
 * Parses a string into a model.
 *
 * @param text The text to parse into a model.
 * @returns The parsed model.
 */
export function parse(text: string): Graph {
  let model: Graph = {
    nodes: [],
    edges: [],
  };

  const lines = text.split("\n").filter((x) => x);

  lines.forEach((line) => {
    let match = line.match(nodePattern);
    if (match) {
      const name = match[1];
      model.nodes.push({ key: name, label: name });
      return;
    }

    match = line.match(edgePattern);
    if (match) {
      const [, from, to] = match;
      model.edges.push({ key: `${from} -> ${to}`, from, to });
      return;
    }
  });

  return model;
}

/**
 * Converts a model to a raw string, maintaining existing content where possible.
 *
 * @param model The model to stringify.
 * @param text The existing text, the structure and content of which will be respected.
 * @returns A string encoding model.
 */
export function stringify(model: Graph, text: string = ""): string {
  const oldModel = parse(text);

  model.nodes.forEach((n) => {
    if (!oldModel.nodes.some((o) => n.key === o.key)) {
      text += n.key + "\n";
    }
  });
  oldModel.nodes.forEach((n) => {
    if (!model.nodes.some((o) => n.key === o.key)) {
      text = text.replaceAll(new RegExp(`^${n.key}$`), "");
    }
  });

  model.edges.forEach((e) => {
    if (!oldModel.edges.some((o) => e.key === o.key)) {
      text += e.key + "\n";
    }
  });
  oldModel.edges.forEach((e) => {
    if (!model.edges.some((o) => e.key === o.key)) {
      text = text.replaceAll(new RegExp(`^${e.key}$`), "");
    }
  });

  return text;
}
