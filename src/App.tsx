import React from "react";
import "./App.css";
import TextEditor from "./features/texteditor/TextEditor";
import Diagram from "./features/diagram/Diagram";

function App() {
  return (
    <div className="App">
      <div className="column">
        <TextEditor />
      </div>
      <div className="column">
        <Diagram />
      </div>
    </div>
  );
}

export default App;
