"use client";
import styles from "./styles.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useOnboardingContext } from "@/lib/context";

export default function Header() {
  const { session } = useOnboardingContext();

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
        {session ? (
          <div className={styles.userBox}>
            <p className={styles.rol}>{session.rol}</p>
            <p className={styles.name}>
              {`${session.nombre} ${session.apellido}`}
            </p>
            <p onClick={() => signOut()} className={styles.red}>
              Cerrar sesión
            </p>
          </div>
        ) : (
          ""
        )}
      </header>
    );
  return <></>;
}
