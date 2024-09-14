"use client";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import React from "react";

const OnboardingContext = React.createContext<any>(undefined);

export const OnboardingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.signOutNextAuth) signOut();
  }, [session]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      signOut({ redirect: false });
    };

    const handleStorageChange = (event: StorageEvent) => {
      console.log({ key: event.key, value: event.newValue });

      if (event.key === "windowClosing") {
        console.log("yoo????");
      }
    };
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "a" || event.key === "A") {
        console.log('La tecla "A" fue presionada');
        sessionStorage.setItem("windowClosing", "false");
      }
      if (event.key === "d" || event.key === "D") {
        console.log('La tecla "D" fue presionada');
        sessionStorage.setItem("windowClosing", "true");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        status,
        session,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
export const useOnboardingContext = () => {
  const onboardingContext = React.useContext(OnboardingContext);
  if (onboardingContext === undefined) {
    throw new Error("useOnboardingContext must be inside a OnboardingProvider");
  }
  return onboardingContext;
};
