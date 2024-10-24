import $ from "jquery";
import katex from "katex";
import React, { useEffect, useRef } from "react";
import ReactQuill, { Quill } from "react-quill";

if (typeof window !== "undefined") {
  window.katex = katex;
  window.jQuery = window.$ = $;
  window.mathquill4quill = require("mathquill4quill");
  require("@edtr-io/mathquill/build/mathquill.js");
}

const QuillEditor = ({ placeholder, value, setValue }) => {
  const options = {
    operators: [
      ["\\pm", "\\pm"],
      ["\\sqrt{x}", "\\sqrt"],
      ["\\sqrt[3]{x}", "\\sqrt[3]{}"],
      ["\\sqrt[n]{x}", "\\nthroot"],
      ["\\frac{x}{y}", "\\frac"],
      ["\\sum^{s}_{x}{d}", "\\sum"],
      ["\\prod^{s}_{x}{d}", "\\prod"],
      ["\\coprod^{s}_{x}{d}", "\\coprod"],
      ["\\int^{s}_{x}{d}", "\\int"],
      ["\\binom{n}{k}", "\\binom"],
      ["\\log_x(y)", "\\log_{}()"],
      ["\\sin(x)", "\\sin{()}"],
      ["\\cos(x)", "\\cos{()}"],
      ["x^{n}", "\\^{}"],
    ],
    displayHistory: true,
  };
  const reactQuillRef = useRef(null);
  const didAttachQuillRefs = useRef(false);

  useEffect(() => {
    if (!didAttachQuillRefs.current) {
      attachQuillRefs();
      didAttachQuillRefs.current = true;
    }
  }, []);

  const attachQuillRefs = () => {
    const enableMathQuillFormulaAuthoring = window.mathquill4quill({
      Quill,
      katex,
    });
    enableMathQuillFormulaAuthoring(
      reactQuillRef.current?.getEditor(),
      options
    );
  };

  return (
    <ReactQuill
      ref={reactQuillRef}
      modules={{
        formula: true,
        toolbar: [
          ["bold", "italic", "underline", "strike", "blockquote", "formula"],
        ],
      }}
      theme="snow"
      placeholder={placeholder || "Compose an epic ..."}
      bounds=".quill"
      value={value}
      onChange={(value) => setValue(value)}
    />
  );
};

export default QuillEditor;
