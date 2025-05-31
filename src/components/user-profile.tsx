"use client";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfile() {
  const router = useRouter();
  const { data: user, isLoading, isError } = api.user.getMe.useQuery();

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh();
        },
        onError: (ctx) => {
          alert(ctx.error.message);
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex items-center gap-3 text-red-500">
        Error loading user data.
      </div>
    );
  }

  return (
    <div className="flex items-start gap-5">
      <div className="flex cursor-pointer items-center">
        <div>
          {user.image ? (
            <Image
              alt={user.name ?? "user image"}
              src={user.image}
              className="inline-block h-9 w-9 rounded-full"
            />
          ) : (
            <div className="bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center text-black">
              {user.name?.charAt(0)}
            </div>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-100 group-hover:text-gray-200">
            {user.name}
          </p>
          <p className="text-xs font-medium text-gray-500 group-hover:text-gray-600">
            {user.email}
          </p>
        </div>
      </div>
      <button onClick={signOut} className="text-sm text-gray-100">
        Sign out
      </button>
    </div>
  );
}
