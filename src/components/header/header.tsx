"use client";
import styles from "./styles.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useOnboardingContext } from "@/lib/context";

export default function Header() {
  const { session } = useOnboardingContext();

  const currentPage = usePathname();

  if (currentPage !== "/" && !currentPage.startsWith("/api"))
    return (
      <header className={styles.header}>
        <nav>
          <ul className={styles.navLinks}>
            <li className={styles.navLink}>
              <Link href={"/home"}>Tablero</Link>
            </li>
          </ul>
        </nav>{" "}
        <div className={styles.userBox}>
          {session ? (
            <>
              <p className={styles.rol}>{session.rol}</p>
              <p className={styles.name}>
                {`${session.nombre} ${session.apellido}`}
              </p>
              <p onClick={() => signOut()} className={styles.red}>
                Cerrar sesión
              </p>
            </>
          ) : (
            <div className={styles.loader}></div>
          )}
        </div>
      </header>
    );
  return <></>;
}
