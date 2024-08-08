import CreateV2 from "@/components/create/createV2/createV2";

export default function Page({ params }: { params: any }) {
  return <CreateV2 id={params.id} />;
}
