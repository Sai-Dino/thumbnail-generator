import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import type { WizardData } from "../generator-wizard"

const LAYOUT_OPTIONS = [
  {
    id: "cinematic_guest",
    name: "Cinematic: Guest Only",
    preview: "/layout-cinematic-guest.png",
    description: "Spotlight your guest with a dramatic, professional look.",
  },
  {
    id: "cinematic_host",
    name: "Cinematic: Host Only",
    preview: "/layout-cinematic-host.png",
    description: "Feature your host in a bold, eye-catching style.",
  },
  {
    id: "cinematic_host_guest",
    name: "Cinematic: Host + Guest",
    preview: "/layout-cinematic-host-guest.png",
    description: "Showcase both host and guest for interview episodes.",
  },
  {
    id: "split_host_guest",
    name: "Split: Host vs. Guest",
    preview: "/layout-split-host-guest.png",
    description: "Perfect for debates, interviews, or contrasting perspectives.",
  },
  {
    id: "panel_group",
    name: "Panel/Group",
    preview: "/layout-panel-group.png",
    description: "Highlight your whole panel or group of guests.",
  },
  {
    id: "brand_logo",
    name: "Brand/Logo Emphasis",
    preview: "/layout-brand-logo.png",
    description: "Reinforce your brand with a logo-forward design.",
  },
]

export function LayoutStep({ data, updateData, onNext }: {
  data: WizardData
  updateData: (d: Partial<WizardData>) => void
  onNext: () => void
}) {
  const [selected, setSelected] = useState<string | undefined>(data.layout)

  const handleSelect = (id: string) => {
    setSelected(id)
    updateData({ layout: id })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Select Thumbnail Layout</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {LAYOUT_OPTIONS.map((opt) => (
          <div
            key={opt.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${selected === opt.id ? "border-primary ring-2 ring-primary" : "border-gray-200 hover:border-primary"}`}
            onClick={() => handleSelect(opt.id)}
          >
            <div className="mb-3 h-32 flex items-center justify-center bg-gray-50 rounded">
              <img src={opt.preview} alt={opt.name} className="h-full object-contain" />
            </div>
            <div className="font-semibold mb-1">{opt.name}</div>
            <div className="text-sm text-gray-500">{opt.description}</div>
          </div>
        ))}
      </div>
      <Button
        className="font-display"
        disabled={!selected}
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  )
} 