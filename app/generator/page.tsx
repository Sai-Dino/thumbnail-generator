import { GeneratorWizard } from "@/components/generator/generator-wizard"
import { Header } from "@/components/header"

export default function GeneratorPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <GeneratorWizard />
      </div>
    </main>
  )
}
