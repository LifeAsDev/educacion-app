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
    const TOKEN_KEY = "sessionExpirationToken";
    const EXPIRATION_INTERVAL = 15000; // 15 segundos

    const updateToken = () => {
      const expirationTime = Date.now() + EXPIRATION_INTERVAL;
      localStorage.setItem(TOKEN_KEY, expirationTime.toString());
    };

    const checkToken = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      /*       console.log({ token });
       */ if (token) {
        const expirationTime = parseInt(token, 10);
        /*     console.log({
          dateNow: Date.now(),
          expirationTime,
          if: Date.now() > expirationTime,
        }); */
        if (Date.now() > expirationTime) {
          localStorage.removeItem(TOKEN_KEY);
          signOut();
        }
      } else {
        updateToken();
      }
    };
    if (session) {
      checkToken();
      const interval = setInterval(updateToken, 7000);

      return () => {
        clearInterval(interval);
      };
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [session]);

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
