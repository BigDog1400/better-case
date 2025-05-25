import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background px-4">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Scale className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold">Better Case</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login">Regístrate</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}