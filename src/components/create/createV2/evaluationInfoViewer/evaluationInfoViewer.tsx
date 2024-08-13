import { FilePDF } from "@/models/evaluationTest";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

import React from "react";

const EvaluationInfoViewer = React.memo(function EvaluationInfoViewer({
  filesArr,
  fileSelected,
}: {
  filesArr: FilePDF[];
  fileSelected: number;
}) {
  const docs = [
    {
      uri: "/evaluation files/ejemplo pruebas.pdf",
      fileType: "pdf",
      fileName: "ejemplo pruebas.pdf",
    },
  ];

  return (
    <iframe
      src={
        filesArr.length && fileSelected >= 0
          ? (() => {
              const blob = new Blob([filesArr[fileSelected].file as Buffer], {
                type: "application/pdf",
              });
              const url = URL.createObjectURL(blob);
              return url;
            })()
          : ""
      }
    />
  );
});

export default EvaluationInfoViewer;
