import React from 'react';

export function PublicFooter() {
  return (
    <footer className="border-t bg-background py-6 md:py-0 px-4">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          © {new Date().getFullYear()} Better Case. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}