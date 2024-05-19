"use client";
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";
import Question from "@/models/question";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function QuillEditor({
  value,
  setValue,
  placeholder,
}: {
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
}) {
  const modules = {
    toolbar: [["bold", "italic", "underline", "strike", "blockquote"]],
  };
  const options = {
    debug: "info",
    modules: {
      toolbar: true,
    },
    theme: "snow",
  };
  return (
    <ReactQuill
      placeholder={placeholder}
      modules={modules}
      theme="snow"
      value={value}
      onChange={(value) => setValue(value)}
    />
  );
}
