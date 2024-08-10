import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

export default function EvaluationInfoViewer() {
  const docs = [
    {
      uri: "/evaluation files/ejemplo pruebas.pdf",
      fileType: "pdf",
      fileName: "ejemplo pruebas.pdf",
    },
  ];

  /*   return <DocViewer pluginRenderers={DocViewerRenderers} documents={docs} />;
   */ return <iframe src="/evaluation files/ejemplo pruebas.pdf" />;
}
