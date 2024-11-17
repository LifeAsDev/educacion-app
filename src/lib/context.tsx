"use client";
import { getSession, signOut, useSession } from "next-auth/react";
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
    if (status === "unauthenticated" && window.location.pathname !== "/") {
      console.log("unauthenticated");
      window.location.reload();
    }
    if (session?.signOutNextAuth) {
      //      signOut();
    }
  }, [status, session]);

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
