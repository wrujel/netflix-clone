import axios from "axios";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useCallback, useState } from "react";
import Input from "../components/Input";

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

  const toggleVariant = useCallback(() => {
    setVariant((currentVariant) =>
      currentVariant === "login" ? "register" : "login"
    );
  }, []);

  const login = useCallback(async () => {
    try {
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/profiles",
      });
    } catch (error: any) {
      throw new Error(error);
    }
  }, [email, password]);

  const register = useCallback(async () => {
    try {
      await axios.post("/api/register", {
        email,
        name,
        password,
      });

      login();
    } catch (error: any) {
      throw new Error(error);
    }
  }, [email, name, password, login]);

  const guestLogin = useCallback(async () => {
    try {
      setIsGuestLoading(true);
      const response = await axios.post("/api/guest");

      const { email: guestEmail, password: guestPassword } = response.data;

      await signIn("credentials", {
        email: guestEmail,
        password: guestPassword,
        callbackUrl: "/profiles",
      });
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsGuestLoading(false);
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
                {variant === "login" ? "Login" : "Sign up"}
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
                {isGuestLoading ? "Continuing as Guest..." : "Continue as Guest"}
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
    </>
  );
};

export default Auth;
