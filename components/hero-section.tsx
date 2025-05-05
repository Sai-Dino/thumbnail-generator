import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Create Eye-Catching Podcast Thumbnails in <span className="text-brand-orange">60 Seconds</span>
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                No design skills needed. Generate professional-looking thumbnails and show art for your podcast with our
                AI-powered tool.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" className="font-display">
                <Link href="/generator">Generate Free Thumbnail</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#features">See How It Works</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative aspect-video overflow-hidden rounded-lg border bg-background shadow-xl">
              <Image
                src="/placeholder.svg?key=dt9er"
                width={1280}
                height={720}
                alt="Thumbnail Generator Demo"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
