"use client";

import Link from "next/link";
import { SfButton, SfIconError, SfIconHome, SfIconUndo } from "@storefront-ui/react";
import { Container } from "@/components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-negative-50 text-negative-600">
          <SfIconError size="lg" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Something went wrong</h1>
        <p className="mt-3 text-neutral-500">
          We hit an unexpected error while loading this page. Try again, or head back to safe ground.
        </p>
        {error?.digest && (
          <p className="mt-2 text-xs text-neutral-400">Reference: {error.digest}</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <SfButton onClick={reset}>
            <SfIconUndo size="sm" /> Try again
          </SfButton>
          <SfButton as={Link} href="/" variant="secondary">
            <SfIconHome size="sm" /> Back to home
          </SfButton>
        </div>
      </div>
    </Container>
  );
}
