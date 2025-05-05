"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { WizardData } from "../generator-wizard"
import { ArrowLeft, ArrowRight } from "lucide-react"

type StyleStepProps = {
  data: WizardData
  updateData: (data: Partial<WizardData>) => void
  onNext: () => void
  onBack: () => void
}

type StyleOption = {
  id: string
  name: string
  description: string
  previewUrl: string
}

const styleOptions: StyleOption[] = [
  {
    id: "photo_cine",
    name: "Cinematic",
    description: "Realistic lighting with depth of field",
    previewUrl: "/placeholder.svg?key=3t2vo",
  },
  {
    id: "semi_edi",
    name: "Editorial",
    description: "Flat shading with muted palette",
    previewUrl: "/placeholder.svg?key=tofun",
  },
  {
    id: "bold_split",
    name: "Pop Art",
    description: "Vector style with bold outlines",
    previewUrl: "/placeholder.svg?key=8y6xw",
  },
  {
    id: "neon_retro",
    name: "Neon Retro",
    description: "80s inspired with neon accents",
    previewUrl: "/placeholder.svg?height=200&width=300&query=80s retro neon podcast thumbnail",
  },
  {
    id: "minimal_clean",
    name: "Minimal",
    description: "Clean design with ample whitespace",
    previewUrl: "/placeholder.svg?height=200&width=300&query=minimal clean podcast thumbnail with whitespace",
  },
  {
    id: "comic_illus",
    name: "Comic",
    description: "Illustrated comic book style",
    previewUrl: "/placeholder.svg?height=200&width=300&query=comic book style podcast thumbnail illustration",
  },
]

export function StyleStep({ data, updateData, onNext, onBack }: StyleStepProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>(data.style)
  const [realism, setRealism] = useState<number>(data.realism)

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId)
    updateData({ style: styleId })
  }

  const handleRealismChange = (value: number[]) => {
    setRealism(value[0])
    updateData({ realism: value[0] })
  }

  const handleContinue = () => {
    updateData({ style: selectedStyle, realism })
    onNext()
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Style</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Choose a style preset for your thumbnail and adjust the realism level.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {styleOptions.map((style) => (
          <div
            key={style.id}
            className={`cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
              selectedStyle === style.id
                ? "border-primary ring-2 ring-primary ring-opacity-50"
                : "border-transparent hover:border-gray-300 dark:hover:border-gray-700"
            }`}
            onClick={() => handleStyleSelect(style.id)}
          >
            <div className="relative h-32 w-full">
              <Image src={style.previewUrl || "/placeholder.svg"} alt={style.name} fill className="object-cover" />
            </div>
            <div className="p-3">
              <h3 className="font-medium">{style.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{style.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <label className="font-medium">Realism Level</label>
          <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">{realism}%</span>
        </div>
        <Slider value={[realism]} min={0} max={100} step={5} onValueChange={handleRealismChange} className="py-4" />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Stylized</span>
          <span>Realistic</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleContinue} className="font-display">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
