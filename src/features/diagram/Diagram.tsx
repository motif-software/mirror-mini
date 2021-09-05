import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";

import { edgeSelectors, nodeSelectors, selectModelData } from "../model/modelSlice";
import { diagramToGraph } from "./diagramSlice";

export default function Diagram() {
  const nodes = useSelector(nodeSelectors.selectAll);
  const edges = useSelector(edgeSelectors.selectAll);
  const modelData = useSelector(selectModelData);

  const dispatch = useDispatch();

  function initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, {
      "undoManager.isEnabled": true,
      initialAutoScale: go.Diagram.Uniform,
      model: $(go.GraphLinksModel, {
        linkKeyProperty: "key",
      }),
      layout: $(go.ForceDirectedLayout),
    });

    // define a simple Node template
    diagram.nodeTemplate = $(
      go.Node,
      "Auto",
      $(go.Shape, "RoundedRectangle", {
        fill: "white",
        strokeWidth: 1,
      }),
      $(
        go.TextBlock,
        { margin: 8, editable: true, font: "400 .875rem Roboto, sans-serif" },
        new go.Binding("text", "label").makeTwoWay()
      )
    );

    diagram.linkTemplate = $(go.Link, $(go.Shape), $(go.Shape, { toArrow: "Standard" }));
    return diagram;
  }

  const onModelChange = (delta: go.IncrementalData) => {
    console.log(delta);
    diagramToGraph(dispatch, delta);
    // dispatch(actions.change(delta));
  };

  return (
    <ReactDiagram
      divClassName="diagram-component"
      initDiagram={initDiagram}
      nodeDataArray={nodes}
      linkDataArray={edges}
      modelData={modelData}
      onModelChange={onModelChange}
      // skipsDiagramUpdate={skipsDiagramUpdate}
    />
  );
}
