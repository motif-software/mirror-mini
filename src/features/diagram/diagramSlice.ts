import { Dispatch, PayloadAction } from "@reduxjs/toolkit";
import {
  Edge,
  edgeAdded,
  edgeRemoved,
  edgeUpdated,
  Node,
  nodeAdded,
  nodeRemoved,
  nodeUpdated,
} from "../model/modelSlice";

export const prefix = "@@gojs/";

export const actionTypes = {
  CHANGE: `${prefix}CHANGE`,
};

export type ChangeAction = PayloadAction<go.IncrementalData>;

const change = (delta: go.IncrementalData): ChangeAction => ({
  type: actionTypes.CHANGE,
  payload: delta,
});

export const actions = {
  change,
};

export function diagramToGraph(dispatch: Dispatch, delta: go.IncrementalData): void {
  delta.removedNodeKeys?.forEach((k) => k && dispatch(nodeRemoved(k)));
  delta.insertedNodeKeys?.forEach((k) => {
    const node = delta.modifiedNodeData?.find((n) => n.key === k) as Node;
    node && dispatch(nodeAdded(node));
  });
  delta.modifiedNodeData?.forEach((n) => {
    if (!delta.insertedNodeKeys?.includes(n.key)) {
      dispatch(nodeUpdated({ id: n.key, changes: n }));
    }
  });

  delta.removedLinkKeys?.forEach((k) => k && dispatch(edgeRemoved(k)));
  delta.insertedLinkKeys?.forEach((k) => {
    const link = delta.modifiedLinkData?.find((l) => l.key === k) as Edge;
    link && dispatch(edgeAdded(link));
  });
  delta.modifiedLinkData?.forEach((l) => {
    if (!delta.insertedLinkKeys?.includes(l.key)) {
      dispatch(edgeUpdated({ id: l.key, changes: l }));
    }
  });
}
