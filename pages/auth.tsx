import axios from "axios";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Input from "../components/Input";
import Loading from "../components/Loading";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import Logo from "../components/Logo";
import background from "../public/images/hero.jpg";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [variant, setVariant] = useState("login");
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleVariant = useCallback(() => {
    setVariant((currentVariant) =>
      currentVariant === "login" ? "register" : "login"
    );
  }, []);

  const router = useRouter();

  useEffect(() => {
    // If navigation starts or completes, clear loading to avoid stale overlay
    const handleRouteChange = () => {
      setIsLoading(false);
      setIsGuestLoading(false);
    };

    // cleanup on unmount
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
      router.events.off("routeChangeError", handleRouteChange);
    };
  }, [router.events]);

  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/profiles",
      });
      // Do not setIsLoading(false) here — wait for router event to clear after navigation
    } catch (error: any) {
      // on error, clear loading so the UI is usable again
      setIsLoading(false);
      throw new Error(error);
    }
  }, [email, password]);

  const register = useCallback(async () => {
    try {
      setIsLoading(true);
      await axios.post("/api/register", {
        email,
        name,
        password,
      });

      await login();
      // loading will be cleared after route change
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error);
    }
  }, [email, name, password, login]);

  const guestLogin = useCallback(async () => {
    try {
      setIsGuestLoading(true);
      setIsLoading(true);
      const response = await axios.post("/api/guest");

      const { email: guestEmail, password: guestPassword } = response.data;

      await signIn("credentials", {
        email: guestEmail,
        password: guestPassword,
        callbackUrl: "/profiles",
      });
      // loading cleared on route change
    } catch (error: any) {
      console.error(error);
      setIsGuestLoading(false);
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      <div className="absolute -z-10 h-full w-full">
        <Image
          src={background}
          alt="background"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="relative">
        <div className="bg-black lg:bg-opacity-50 h-screen">
          <nav className="px-12 py-5">
            <div className="w-[200px]">
              <Logo />
            </div>
          </nav>
          <div className="flex justify-center">
            <div className="bg-black bg-opacity-70 px-16 py-16 self-center mt-2 lg:w-2/5 lg:max-w-md rounded-md w-full">
              <h2 className="text-white text-4xl mb-8 font-semibold">
                {variant === "login" ? "Sign In" : "Register"}
              </h2>
              <div className="flex flex-col gap-4">
                {variant === "register" && (
                  <Input
                    id="name"
                    label="Username"
                    type="text"
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                  />
                )}
                <Input
                  id="email"
                  label="Email"
                  type="text"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
              <button
                onClick={variant === "login" ? login : register}
                disabled={isLoading}
                className="
                  bg-red-600
                  py-3
                  text-white
                  rounded-md
                  w-full
                  mt-10
                  hover-bg-red-700
                  transition
                  translate-y-0.5
                "
              >
                {isLoading
                  ? variant === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : variant === "login"
                  ? "Login"
                  : "Sign up"}
              </button>
              <button
                onClick={guestLogin}
                disabled={isGuestLoading}
                className="
                  bg-neutral-700
                  py-3
                  text-white
                  rounded-md
                  w-full
                  mt-4
                  hover:opacity-90
                  transition
                "
              >
                {isGuestLoading
                  ? "Continuing as Guest..."
                  : "Continue as Guest"}
              </button>
              <div
                className="
                  flex
                  flex-row
                  items-center
                  gap-4
                  mt-8
                  justify-center
                "
              >
                <div
                  onClick={() => signIn("google", { callbackUrl: "/profiles" })}
                  className="
                    w-10
                    h-10
                    bg-white
                    rounded-full
                    flex
                    items-center
                    justify-center
                    cursor-pointer
                    hover:opacity-80
                    transition
                  "
                >
                  <FcGoogle size={30} />
                </div>
                <div
                  onClick={() => signIn("github", { callbackUrl: "/profiles" })}
                  className="
                    w-10
                    h-10
                    bg-white
                    rounded-full
                    flex
                    items-center
                    justify-center
                    cursor-pointer
                    hover:opacity-80
                    transition
                  "
                >
                  <FaGithub size={30} />
                </div>
              </div>
              <p className="text-neutral-500 mt-12">
                {variant === "login"
                  ? "First time using Netflix?"
                  : "Already have an account?"}
                <span
                  onClick={toggleVariant}
                  className="text-white ml-1 hover:underline cursor-pointer "
                >
                  {variant === "login" ? "Create an account" : "Login"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {isLoading && (
        <Loading message={variant === "login" ? "Signing in" : "Processing"} />
      )}
    </>
  );
};

export default Auth;
