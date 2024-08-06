"use client";
import QuestionsFlexBox from "@/components/create/createV2/questionsFlexBox/questionsFlexBox";
import styles from "./styles.module.css";
import { useState, useEffect, useRef, ChangeEvent } from "react";

export default function CreateV2({ id }: { id?: string }) {
  const [tabSelected, setTabSelected] = useState("general");
  return (
    <main className={styles.main}>
      <QuestionsFlexBox
        tabSelected={tabSelected}
        setTabSelected={setTabSelected}
      />
    </main>
  );
}
