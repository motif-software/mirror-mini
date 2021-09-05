import { createAction, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { merge } from "lodash";
import { RootState } from "../../app/store";

// Domain specific graph model

export type Node = {
  key: string;
  label: string;
  location?: string;
};

export type Edge = {
  key: string;
  from: string;
  to: string;
};

export type Graph = {
  nodes: Node[];
  edges: Edge[];
};

export type Element = Node | Edge;

// Redux models

const nodeAdapter = createEntityAdapter<Node>({
  selectId: (c) => c.key,
});
const edgeAdapter = createEntityAdapter<Edge>({
  selectId: (i) => i.key,
});

const elementAdapter = createEntityAdapter<Element>({
  selectId: (e) => e.key,
});

export const reset = createAction<void>("resetGraph");

type Init<T> = { ids: (string | number)[]; entities: { [key: string]: T } };

const nodeInit: Init<Node> = {
  ids: ["A", "B"],
  entities: {
    A: { key: "A", label: "A" },
    B: { key: "B", label: "B" },
  },
};

export const nodeSlice = createSlice({
  name: "node",
  initialState: nodeAdapter.getInitialState(nodeInit),
  reducers: {
    nodeAdded: nodeAdapter.addOne,
    nodeRemoved: nodeAdapter.removeOne,
    nodeUpdated: nodeAdapter.updateOne,
  },
  extraReducers: (builder) => {
    builder.addCase(reset, (state) => {
      nodeAdapter.setAll(state, []);
    });
  },
});

const edgeInit: Init<Edge> = {
  ids: ["AB"],
  entities: {
    AB: { key: "AB", from: "A", to: "B" },
  },
};

export const edgeSlice = createSlice({
  name: "edge",
  initialState: edgeAdapter.getInitialState(edgeInit),
  reducers: {
    edgeAdded: edgeAdapter.addOne,
    edgeRemoved: edgeAdapter.removeOne,
    edgeUpdated: edgeAdapter.updateOne,
  },
  extraReducers: (builder) => {
    builder.addCase(reset, (state) => {
      edgeAdapter.setAll(state, []);
    });
  },
});

export const { nodeAdded, nodeRemoved, nodeUpdated } = nodeSlice.actions;
export const { edgeAdded, edgeRemoved, edgeUpdated } = edgeSlice.actions;

export const modelDataSlice = createSlice({
  name: "modelData",
  initialState: {},
  reducers: {},
});

export const reducer = combineReducers({
  nodes: nodeSlice.reducer,
  edges: edgeSlice.reducer,
  modelData: modelDataSlice.reducer,
});

type GraphState = ReturnType<typeof reducer>;

export const nodeSelectors = nodeAdapter.getSelectors<RootState>((state) => state.graph.nodes);
export const edgeSelectors = edgeAdapter.getSelectors<RootState>((state) => state.graph.edges);
export const selectModelData = (state: GraphState) => state.modelData;

/** Selectors for a view over the union of nodes and edges. */
export const elementSelectors = elementAdapter.getSelectors<RootState>((state) => ({
  ids: nodeSelectors.selectIds(state).concat(edgeSelectors.selectIds(state)),
  entities: merge({}, nodeSelectors.selectEntities(state), edgeSelectors.selectEntities(state)),
}));
