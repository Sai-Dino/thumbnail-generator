"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { UploadStep } from "./steps/upload-step"
import { StyleStep } from "./steps/style-step"
import { TitleStep } from "./steps/title-step"
import { TitleStepFallback } from "./steps/title-step-fallback" // Import the fallback component
import { GeneratingStep } from "./steps/generating-step"
import { EditorStep } from "./steps/editor-step"
import { WizardProgress } from "./wizard-progress"
import { Toaster } from "@/components/ui/toaster"
import { debugLog } from "@/lib/debug"
import { LayoutStep } from "./steps/layout-step"

type WizardStep = "layout" | "upload" | "style" | "title" | "generating" | "editor"

export type WizardData = {
  layout?: string
  hostImageUrl?: string
  guestImageUrls?: string[]
  style: string
  realism: number
  title: string
  generationId?: string
  thumbnailUrl?: string
  squareArtworkUrl?: string
  refinedTitle?: string
}

export function GeneratorWizard() {
  const [step, setStep] = useState<WizardStep>("layout")
  const [data, setData] = useState<WizardData>({
    layout: undefined,
    guestImageUrls: [],
    style: "photo_cine",
    realism: 75,
    title: "",
  })
  const [useApiForTitles, setUseApiForTitles] = useState(true)

  const updateData = (newData: Partial<WizardData>) => {
    debugLog("Updating wizard data:", newData)
    setData((prev) => ({ ...prev, ...newData }))
  }

  const goToNextStep = () => {
    const steps: WizardStep[] = ["layout", "upload", "style", "title", "generating", "editor"]
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1]
      debugLog(`Moving from step ${step} to ${nextStep}`)
      setStep(nextStep)
    }
  }

  const goToPreviousStep = () => {
    const steps: WizardStep[] = ["layout", "upload", "style", "title", "generating", "editor"]
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1]
      debugLog(`Moving from step ${step} to ${prevStep}`)
      setStep(prevStep)
    }
  }

  // Handle API errors for title step
  const handleTitleApiError = () => {
    debugLog("Title API error, switching to fallback")
    setUseApiForTitles(false)
  }

  return (
    <>
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6">
          {step !== "editor" && (
            <WizardProgress currentStep={step === "generating" ? "title" : step} className="mb-8" />
          )}

          <div className="z-10 relative" style={{ pointerEvents: "all" }}>
            {step === "layout" && <LayoutStep data={data} updateData={updateData} onNext={goToNextStep} />}
            {step === "upload" && <UploadStep data={data} updateData={updateData} onNext={goToNextStep} />}

            {step === "style" && (
              <StyleStep data={data} updateData={updateData} onNext={goToNextStep} onBack={goToPreviousStep} />
            )}

            {step === "title" && useApiForTitles && (
              <TitleStep data={data} updateData={updateData} onNext={goToNextStep} onBack={goToPreviousStep} />
            )}

            {step === "title" && !useApiForTitles && (
              <TitleStepFallback data={data} updateData={updateData} onNext={goToNextStep} onBack={goToPreviousStep} />
            )}

            {step === "generating" && (
              <GeneratingStep data={data} updateData={updateData} onComplete={() => setStep("editor")} />
            )}

            {step === "editor" && <EditorStep data={data} />}
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </>
  )
}
