import type React from "react"
import { RectangleHorizontal, RectangleVertical, Square } from "lucide-react"
import { aspectRatios, type AspectRatio } from "../assets/assets"

type Props = {
  value: AspectRatio
  onChange: (value: AspectRatio) => void
}

const AspectRatioSelecter = ({ value, onChange }: Props) => {
  const iconMap: Record<AspectRatio, React.ReactNode> = {
    "16:9": <RectangleHorizontal className="size-6" />,
    "1:1": <Square className="size-6" />,
    "9:16": <RectangleVertical className="size-6" />,
  }
  console.log(value);
  

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-200">
        Aspect Ratio
      </label>

      <div className="flex flex-wrap gap-2">
        {aspectRatios.map((ratio) => {
          const selected = value === ratio

          return (
            <button
              key={ratio}
              type="button"
              onClick={() => onChange(ratio)}
              className={`flex items-center gap-2 rounded-md border px-5 py-2.5 text-sm transition border-white/10 ${
                selected ? "bg-white/10" : "hover:bg-white/10"
              }`}
            >
              {iconMap[ratio]}
              <span className="tracking-widest">{ratio}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AspectRatioSelecter
