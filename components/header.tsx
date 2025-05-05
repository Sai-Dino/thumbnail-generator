import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-brand-orange">AIP</span>
          <span className="font-display text-xl">Thumbnail Generator</span>
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button asChild variant="outline">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/generator">Generate Now</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
