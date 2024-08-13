import { FilePDF } from "@/models/evaluationTest";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

import React from "react";

const EvaluationInfoViewer = React.memo(function EvaluationInfoViewer({
  filesArr,
  fileSelected,
  evaluationId,
}: {
  filesArr: FilePDF[];
  fileSelected: number;
  evaluationId?: string;
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
          ? typeof filesArr[fileSelected].file === "string"
            ? `/api/get-image?photoName=${evaluationId}/${
                filesArr[fileSelected]._id
              }.pdf&type=${"application/pdf"}`
            : (() => {
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
