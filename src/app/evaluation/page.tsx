import Evaluation from "@/components/evaluation/evaluation";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <Evaluation />
    </Suspense>
  );
}
