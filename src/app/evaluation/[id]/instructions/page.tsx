import Instructions from "@/components/inEvaluation/instructions/instructions";

export default function Page({ params }: { params: any }) {
  return <Instructions id={params.id} />;
}
