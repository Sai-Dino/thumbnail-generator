import Image from "next/image"

export function SocialProofSection() {
  return (
    <section className="py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Trusted by Podcasters Everywhere
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Join thousands of podcasters who use our tool to create professional thumbnails
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <div className="relative h-12 w-32 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                <Image
                  src={`/placeholder.svg?key=j4ei0&height=48&width=128&query=podcast network logo ${i + 1}`}
                  alt={`Podcast Network ${i + 1}`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
