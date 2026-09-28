import Link from "next/link";
import { SfButton, SfIconSearch, SfIconHome, SfIconShoppingCart } from "@storefront-ui/react";
import { Container } from "@/components/ui";
import { CATEGORIES } from "@/lib/data";

export default function NotFound() {
  return (
    <Container className="py-16">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="font-headings text-7xl font-bold text-primary-600 sm:text-8xl">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Page not found</h1>
        <p className="mt-3 text-neutral-500">
          The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back to shopping.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <SfButton as={Link} href="/">
            <SfIconHome size="sm" /> Back to home
          </SfButton>
          <SfButton as={Link} href="/category/mobiles" variant="secondary">
            <SfIconSearch size="sm" /> Browse products
          </SfButton>
          <SfButton as={Link} href="/cart" variant="tertiary">
            <SfIconShoppingCart size="sm" /> View cart
          </SfButton>
        </div>

        <div className="mt-10 w-full border-t border-neutral-200 pt-6">
          <p className="text-sm font-semibold text-neutral-700">Popular categories</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {CATEGORIES.slice(0, 8).map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:border-primary-500 hover:text-primary-700">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
