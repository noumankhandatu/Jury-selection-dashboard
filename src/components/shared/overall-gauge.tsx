import type React from "react";
import GaugeChart from "react-gauge-chart";

interface OverallGaugeProps {
  valuePercent: number; // 0-100
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const OverallGauge: React.FC<OverallGaugeProps> = ({
  valuePercent,
  size = "md",
  showLabel = true,
}) => {
  const clamped = Math.max(0, Math.min(100, valuePercent));

  const getSizeConfig = () => {
    switch (size) {
      case "xs":
        return { width: 40, height: 28, fontSize: "8px", marginTop: -4 };
      case "sm":
        return { width: 60, height: 40, fontSize: "10px", marginTop: -5 };
      case "md":
        return { width: 80, height: 50, fontSize: "12px", marginTop: -8 };
      case "lg":
        return { width: 120, height: 75, fontSize: "14px", marginTop: -12 };
      default:
        return { width: 80, height: 50, fontSize: "12px", marginTop: -8 };
    }
  };

  const { width, height, fontSize, marginTop } = getSizeConfig();
  // Thresholds: <60 red, 60–79 amber, ≥80 green
  const colors = ["#ef4444", "#f59e0b", "#10b981"]; // red -> amber -> green
  const arcsLength = [0.6, 0.19, 0.21];

  return (
    <div
      className="relative inline-flex flex-col items-center justify-center"
      style={{ width, height: height + (showLabel ? 20 : 0) }}
    >
      <div style={{ marginTop }}>
        <GaugeChart
          id={`overall-gauge-${Math.random()}`}
          nrOfLevels={3}
          arcsLength={arcsLength}
          colors={colors}
          arcWidth={0.3}
          percent={clamped / 100}
          hideText={true}
          animate={true}
          animDelay={0}
          animateDuration={800}
          style={{ width, height }}
        />
      </div>

      {showLabel && (
        <div
          className="absolute bottom-0 flex flex-col items-center"
          style={{ fontSize }}
        >
          <span className="font-bold text-gray-700">
            {Math.round(clamped)}%
          </span>
          <span className="text-gray-500 text-[10px]">Overall</span>
        </div>
      )}
    </div>
  );
};

export default OverallGauge;
