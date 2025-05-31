import Link from "next/link";
import { HydrateClient } from "@/trpc/server";
import UserProfile from "@/components/user-profile";
import { getSession } from "@/server/auth";

export default async function Home() {
  const session = await getSession()
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-[hsl(280,100%,70%)]">T3</span> App{" "}
            <span className="text-[hsl(280,100%,70%)]">x </span> Better Auth{" "}
            <div className="ml-[-10px] inline-flex h-3 w-3 rounded-full bg-white"></div>
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://create.t3.gg/en/introduction"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">T3 →</h3>
              <div className="text-lg">
                Learn more about Create T3 App, the libraries it uses, and how
                to deploy it.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="https://better-auth.com/docs"
              target="_blank"
            >
              <h3 className="text-2xl font-bold">Better Auth →</h3>
              <div className="text-lg">
                Learn more about Better Auth, the plugin ecosystem, next js integrations and more.
              </div>
            </Link>
          </div>
          {session?.user ? (
            <UserProfile />
          ) : (
            <a href="/login">
              <button
                type="submit"
                className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
              >
                Login
              </button>
            </a>
          )}

          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
             hello world
            </p>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
