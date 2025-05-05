import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  return (
    <section className="bg-gray-10 py-20 dark:bg-gray-90">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Everything you need to know about our thumbnail generator
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl py-12">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How long does it take to generate a thumbnail?</AccordionTrigger>
              <AccordionContent>
                Our AI-powered generator creates thumbnails in under 60 seconds, from upload to download. The actual
                generation process typically takes 15-30 seconds.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Do I need design skills to use this tool?</AccordionTrigger>
              <AccordionContent>
                Not at all! Our tool is designed for podcasters without design experience. Simply upload your images,
                choose a style, and our AI handles the rest.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What file formats can I download?</AccordionTrigger>
              <AccordionContent>
                You can download your thumbnails as PNG files (1280×720px for YouTube) and square show art
                (3000×3000px). Paid tiers also include layered PSD or SVG files for further editing.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>How many thumbnails can I generate?</AccordionTrigger>
              <AccordionContent>
                The free tier allows one export with a watermark. Our Starter tier ($9/mo) includes unlimited exports
                without watermarks, while the Pro tier ($49/mo) adds brand kits, batch generation, and more.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Can I edit the generated thumbnails?</AccordionTrigger>
              <AccordionContent>
                Yes! Our canvas editor lets you drag faces, adjust text, and tweak colors. For more advanced editing,
                you can download layered files (PSD/SVG) with our paid tiers.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}
