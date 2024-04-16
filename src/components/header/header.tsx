"use client";
import styles from "./styles.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Header() {
  const currentPage = usePathname();

  if (currentPage !== "/")
    return (
      <header className={styles.header}>
        <nav>
          <ul className={styles.navLinks}>
            <li className={styles.navLink}>
              <Link href={"/home"}>Tablero</Link>
            </li>
          </ul>
        </nav>
        <div className={styles.userBox}>
          <p className={styles.rol}>Estudiante</p>
          <p className={styles.name}>Angelo Sarmiento</p>
          <p onClick={() => signOut()} className={styles.red}>
            Cerrar sesión
          </p>
        </div>
      </header>
    );
  return <></>;
}
