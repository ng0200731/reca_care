"use client";

import { useLayoutStore } from "@/store/layoutStore";
import MaterialSelection from "./steps/MaterialSelection";
import SizeOrientation from "./steps/SizeOrientation";
import CuttingTypeStep from "./steps/CuttingType";
import LoopDetails from "./steps/LoopDetails";
import PaddingConfig from "./steps/PaddingConfig";
import FinalView from "./steps/FinalView";

export default function StepRenderer() {
  const step = useLayoutStore((s) => s.step);

  switch (step) {
    case "material":
      return <MaterialSelection />;
    case "size":
      return <SizeOrientation />;
    case "cutting":
      return <CuttingTypeStep />;
    case "loop-details":
      return <LoopDetails />;
    case "padding":
      return <PaddingConfig />;
    case "final":
      return <FinalView />;
    default:
      return <MaterialSelection />;
  }
}
