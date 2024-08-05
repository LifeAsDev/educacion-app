"use client";
import QuestionsFlexBox from "@/components/create/createV2/questionsFlexBox/questionsFlexBox";
import styles from "./styles.module.css";
import { useState, useEffect, useRef, ChangeEvent } from "react";

export default function CreateV2({ id }: { id?: string }) {
  return (
    <main className={styles.main}>
      <QuestionsFlexBox />
    </main>
  );
}
