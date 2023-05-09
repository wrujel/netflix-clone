import Image from "next/image";
import Input from "../components/Input";
import { useCallback, useState } from "react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [variant, setVariant] = useState("login");

  const toggleVariant = useCallback(() => {
    setVariant((currentVariant) =>
      currentVariant === "login" ? "register" : "login"
    );
  }, []);

  return (
    <>
      <Image
        src={"/images/hero.jpg"}
        alt="background"
        fill
        style={{ objectFit: "cover" }}
        className="-z-10"
      />
      <div className="relative top-0 left-0">
        <div className="bg-black lg:bg-opacity-50 h-screen">
          <nav className="px-12 py-5">
            <Image src="/images/logo.png" alt="Logo" width={200} height={0} />
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
                  type="text"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
              <button
                className="
                  bg-red-600
                  py-3
                  text-white
                  rounded-md
                  w-full
                  mt-10
                  hover-bg-red-700
                  transition
                "
              >
                {variant === "login" ? "Login" : "Sign up"}
              </button>
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
