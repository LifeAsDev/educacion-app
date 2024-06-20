import EvaluationsASsignOpenAnswers from "@/components/evaluation/evaluationsAssignOpenAnswers/evaluationsAssignOpenAnswers";

export default function Page({ params }: { params: any }) {
  return (
    <EvaluationsASsignOpenAnswers
      evaluationAssignId={params.evaluationAssignId}
    />
  );
}
