import EvaluationCursoStats from "@/components/evaluation/evaluationCursoStats/evaluationCursoStats";

export default function Page({ params }: { params: any }) {
  return <EvaluationCursoStats evaluationId={params.evaluationId} />;
}
