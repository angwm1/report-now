// File: /src/components/LoginCard.js
"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSpinner } from "react-icons/fa";
import Image from "next/image";

export default function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      const session = await getSession();
      // Adjust these paths as needed
      if (session && session.user && session.user.role === "admin") {
        router.push("/superAdmin/dashboard");
      } else {
        router.push("/issues");
      }
    }
  }

  function handleSingpass() {
    alert("Singpass login placeholder! Replace with real OIDC flow.");
  }

  return (
    <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Welcome Back!</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col space-y-5">
        <div>
          <label className="block mb-1 text-gray-700">Email Address</label>
          <input
            type="email"
            className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6F3C] transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-700">Password</label>
          <input
            type="password"
            className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FF6F3C] transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-500 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          className="bg-[#FF6F3C] text-white py-2 rounded hover:bg-orange-600 transition-all flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Login"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Not a member?{" "}
        <Link href="/register" className="text-blue-500 hover:underline">
          Register now
        </Link>
      </p>
      <div className="flex items-center my-5">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="mx-2 text-gray-400">Or</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>
      <button
        onClick={handleSingpass}
        className="w-full py-2 rounded transition-all bg-transparent"
      >
        <Image
          src="/images/singpass-logo.png"
          alt="Log in with Singpass"
          width={256} // For example, equivalent to Tailwind's w-64 (256px)
          height={100} // Adjust the height to preserve your image's aspect ratio
          className="mx-auto transition-all duration-200 hover:brightness-75"
        />
      </button>
    </div>
  );
}
