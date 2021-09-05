import { isEqual } from "lodash";
import { PayloadAction, Store } from "@reduxjs/toolkit";
import {
  Edge,
  edgeAdded,
  edgeRemoved,
  edgeUpdated,
  Node,
  nodeAdded,
  nodeRemoved,
  nodeUpdated,
  reset,
} from "../model/modelSlice";
import { change } from "./textEditorSlice";
import { MappingRegistration } from "../../app/middleware";
import { parse, stringify } from "./textParser";
import { RootState } from "../../app/store";

// Canonical type.
export interface DiagramEvent {
  type: string;
  data?: go.IncrementalData;
}

type TextChangeAction = PayloadAction<string>;

const textChangeMapper: MappingRegistration<TextChangeAction, DiagramEvent> = {
  fromCanonical: (store: Store, action: DiagramEvent) => {
    console.log("diagram change, need to build a text change");
    const state = store.getState() as RootState;
    const spec = stringify(
      {
        nodes: Object.values(state.graph.nodes.entities) as any as Node[],
        edges: Object.values(state.graph.edges.entities) as any as Edge[],
      },
      state.text.value
    );
    return change(spec);
  },

  toCanonical: (store: Store, action: TextChangeAction): DiagramEvent | DiagramEvent[] | null => {
    console.log("text change, need to build a diagram change");
    if (action.payload === "") {
      return reset();
    }
    try {
      const state = store.getState();
      const model: any = parse(action.payload);
      console.log("parsed", model);

      const nodeActions = () => {
        const valid = (n) => n && n.key && n.label;
        const exists = (n) => n.key in state.graph.nodes.entities;
        const same = (n) => isEqual(n, state.graph.nodes.entities[n.key]);

        const newNodes = model.nodes
          .filter(valid)
          .filter((n) => !exists(n))
          .map(nodeAdded);
        const modifiedNodes = model.nodes
          .filter(valid)
          .filter(exists)
          .filter((n) => !same(n))
          .map((n) => nodeUpdated({ id: n.key, changes: n }));
        const modelKeys = model.nodes.map((n) => n.key);
        const deletedNodes = state.graph.nodes.ids
          .filter((k) => !modelKeys.includes(k))
          .map(nodeRemoved);
        return [].concat(newNodes, modifiedNodes, deletedNodes);
      };

      const edgeActions = () => {
        const valid = (e) => e && e.key && e.from && e.to;
        const exists = (e) => e.key in state.graph.edges.entities;
        const same = (e) => isEqual(e, state.graph.edges.entities[e.key]);

        const newEdges = model.edges
          .filter(valid)
          .filter((e) => !exists(e))
          .map(edgeAdded);
        const modifiedEdges = model.edges
          .filter(valid)
          .filter(exists)
          .filter((e) => !same(e))
          .map((e) => edgeUpdated({ id: e.key, changes: e }));

        const modelKeys = model.edges.map((e) => e.key);
        const deletedEdges = state.graph.edges.ids
          .filter((k) => !modelKeys.includes(k))
          .map(edgeRemoved);
        return [].concat(newEdges, modifiedEdges, deletedEdges);
      };

      return nodeActions().concat(edgeActions());
    } catch (e) {
      console.error(e);
      return null;
    }
  },
};

export const registry = [
  {
    [change.type]: textChangeMapper,
  },
];

export const canonicalTypes = [
  nodeAdded.type,
  nodeUpdated.type,
  nodeRemoved.type,
  edgeAdded.type,
  edgeUpdated.type,
  edgeRemoved.type,
];
