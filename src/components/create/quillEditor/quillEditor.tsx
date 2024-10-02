"use client";
import "react-quill/dist/quill.snow.css";
import "katex/dist/katex.min.css";
import katex from "katex"; // Importar KaTeX en tu código

import dynamic from "next/dynamic";
import React, { useState, useRef, useEffect, MutableRefObject } from "react";

if (typeof window !== "undefined") {
  window.katex = katex;
  /*   window.jQuery = window.$ = $;
   */
}
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");
    // @ts-ignore
    // eslint-disable-next-line react/display-name
    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  { ssr: false }
);

export default function QuillEditor({
  value,
  setValue,
  placeholder,
  forwardedRef,
}: {
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  forwardedRef?: MutableRefObject<null>;
}) {
  const quillRef = useRef(null);
  const regex = /(<([^>]+)>)/gi;

  const modules = {
    toolbar: [["bold", "italic", "underline", "strike", "blockquote"]],
    formula: true, // Enable the formula module
  };

  useEffect(() => {
    if (
      quillRef.current &&
      placeholder === "Pregunta" &&
      !value.replace(regex, "").length
    ) {
      // @ts-ignore
      const editor = quillRef.current.getEditor();

      const delta = editor.format("bold", true);
    }
    // eslint-disable-next-line
  }, [placeholder, value]);

  return (
    <ReactQuill
      // @ts-ignore
      forwardedRef={forwardedRef || quillRef}
      placeholder={placeholder}
      modules={modules}
      theme="snow"
      value={value}
      onChange={(value: string) => setValue(value)}
    />
  );
}
