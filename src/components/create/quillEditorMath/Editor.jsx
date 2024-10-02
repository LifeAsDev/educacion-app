"use client";
import dynamic from "next/dynamic";
import React from "react";

const QuillEditor = dynamic(
  () => import("./QuillEditor").then((mod) => mod.default),
  { ssr: false, loading: () => <p>Editor loading ...</p> }
);

class EditorEquations extends React.Component {
  render() {
    return <QuillEditor {...this.props} />;
  }
}

export default EditorEquations;
