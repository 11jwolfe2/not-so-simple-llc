import "@testing-library/jest-dom/vitest"
import React from "react"
import { vi } from "vitest"

vi.mock("next/image", () => ({
  default: ({ priority, fill, quality, placeholder, blurDataURL, loader, ...rest }: any) =>
    React.createElement("img", rest),
}))
