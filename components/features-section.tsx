import { Clock, ImageIcon, Layers, Palette, Sparkles, Wand2 } from "lucide-react"

export function FeaturesSection() {
  return (
    <section id="features" className="bg-gray-10 py-20 dark:bg-gray-90">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Features That Make Thumbnail Creation Easy
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Our AI-powered tool helps podcasters create professional thumbnails without design skills
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-card">
            <div className="rounded-full bg-primary/10 p-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Fast Generation</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Create thumbnails in under 60 seconds, no waiting required
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-card">
            <div className="rounded-full bg-primary/10 p-3">
              <Wand2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">AI-Powered</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Advanced AI generates professional designs automatically
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-card">
            <div className="rounded-full bg-primary/10 p-3">
              <ImageIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Auto Background Removal</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Upload faces and we'll remove backgrounds automatically
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-card">
            <div className="rounded-full bg-primary/10 p-3">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Style Presets</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Choose from multiple professional style presets
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-card">
            <div className="rounded-full bg-primary/10 p-3">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Layered Exports</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Download as PNG or layered PSD/SVG for further editing
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-card">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Title Generation</h3>
            <p className="text-center text-gray-500 dark:text-gray-400">
              Need a title? Our AI can suggest catchy episode titles
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
