"use client";
import styles from "./styles.module.css";
import { usePathname } from "next/navigation";

export default function Header() {
  const currentPage = usePathname();

  if (currentPage !== "/")
    return (
      <header className={styles.header}>
        <p className={styles.rol}>Estudiante</p>
        <p className={styles.name}>Angelo Sarmiento</p>
        <p className={styles.red}>Cerrar sesión</p>
      </header>
    );
  return <></>;
}
