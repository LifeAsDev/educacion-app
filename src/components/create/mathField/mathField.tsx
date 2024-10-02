"use client";
import { useEffect, useRef, useState } from "react";
import { MathfieldElement } from "mathlive";
import styles from "./styles.module.css";
import QuillEditor from "@/components/create/quillEditor/quillEditor";
import $ from "jquery";
import katex from "katex";
import React from "react";
import ReactQuill, { Quill } from "react-quill";

if (typeof window !== "undefined") {
  window.katex = katex;
  window.jQuery = window.$ = $;
  window.mathquill4quill = require("mathquill4quill");
  require("@edtr-io/mathquill/build/mathquill.js");
}

const MathField = () => {
  const mathFieldRef = useRef<MathfieldElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mathValue, setMathValue] = useState<string>(""); // Valor de la fórmula
  const [question, setQuestion] = useState("");
  const quillEditorRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !mathFieldRef.current) {
      // Initialize MathfieldElement
      const mfe = new MathfieldElement();
      mathFieldRef.current = mfe;

      if (containerRef.current) {
        containerRef.current.appendChild(mfe); // Append MathfieldElement to the container
      }

      // Add listener for input events to update the value
      mfe.addEventListener("input", () => {
        setMathValue(mfe.getValue()); // Get value from MathfieldElement
      });
    }
  }, []);

  const insertMathInQuill = () => {
    if (mathValue && quillEditorRef.current) {
      // @ts-ignore
      const quillEditor = quillEditorRef.current.getEditor(); // Usar el ref del editor de Quill
      const index =
        quillEditor.getSelection()?.index || quillEditor.getLength();

      console.log(quillEditor.insertEmbed(index, "formula", mathValue)); // Inserta la fórmula en Quill
      quillEditor.setSelection(index + 1); // Mueve el cursor después de la fórmula
    }
  };

  useEffect(() => {
    console.log(question);
  }, [question]);
  return (
    <main className={styles.main}>
      <div ref={containerRef}></div>
      <p>MathField Value: {mathValue}</p>
      <button onClick={insertMathInQuill}>Insertar fórmula en Quill</button>
      <QuillEditor
        setValue={setQuestion}
        value={question}
        placeholder="Pregunta"
        forwardedRef={quillEditorRef} // Pasar el ref al componente QuillEditor
      />
      <div dangerouslySetInnerHTML={{ __html: question }}></div>
    </main>
  );
};

export default MathField;
