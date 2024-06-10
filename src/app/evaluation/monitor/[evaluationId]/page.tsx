import EvaluationsOnCourseTable from "@/components/evaluation/evaluationsOnCourseTable/evaluationsOnCourseTable";

export default function Page({ params }: { params: any }) {
  return <EvaluationsOnCourseTable evaluationId={params.evaluationId} />;
}
