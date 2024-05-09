import Create from "@/components/create/create";

export default function Page({ params }: { params: any }) {
  return <Create id={params.id} />;
}
