import InEvaluationV2 from "@/components/inEvaluation/inEvaluationV2/inEvaluationV2";

export default function Page({ params }: { params: any }) {
  return <InEvaluationV2 id={params.id} />;
}
