import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
        <div className="flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold text-brand-orange">AIP</span>
            <span className="font-display text-xl">Thumbnail Generator</span>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create eye-catching podcast thumbnails in seconds</p>
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <nav className="flex gap-4 md:gap-6">
            <Link
              href="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              Contact
            </Link>
          </nav>
          <div className="text-sm text-gray-500 dark:text-gray-400">© 2025 AIP. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
