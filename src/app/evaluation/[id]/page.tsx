import InEvaluation from "@/components/inEvaluation/inEvaluation";

export default function Page({ params }: { params: any }) {
  return <InEvaluation id={params.id} />;
}
