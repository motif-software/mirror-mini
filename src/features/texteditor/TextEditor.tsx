import React from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { change, selectValue } from "./textEditorSlice";

export default function TextEditor() {
  const dispatch = useAppDispatch();
  const code = useAppSelector(selectValue);

  const onValueChange = (code: string) => {
    dispatch(change(code));
  };

  return (
    <Editor
      value={code}
      onValueChange={onValueChange}
      highlight={(code) => highlight(code, languages.js, "js")}
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 16,
      }}
    />
  );
}
