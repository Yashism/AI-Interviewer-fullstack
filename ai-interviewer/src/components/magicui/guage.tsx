"use client";

import GaugeCircle from "./guage-circle";

export function GaugeCircleDemo() {
  return (
    <GaugeCircle
      max={100}
      min={0}
      value={26}
      gaugePrimaryColor="#e9e9e9"
      gaugeSecondaryColor="rgba(70, 70, 70, 0.7)"
    />
  );
}
