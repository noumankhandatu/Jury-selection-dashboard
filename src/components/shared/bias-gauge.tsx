import type React from "react";
import GaugeChart from "react-gauge-chart";

interface BiasGaugeProps {
  biasStatus: "low" | "moderate" | "high";
  size?: "sm" | "md" | "lg";
  isHighlighted?: boolean;
  showLabel?: boolean;
  // Optional numeric score. Accepts 0-1 or 0-100 and normalizes internally.
  scorePercent?: number;
}

export const BiasGauge: React.FC<BiasGaugeProps> = ({
  biasStatus,
  size = "md",
  isHighlighted = false,
  showLabel = true,
  scorePercent,
}) => {
  const getBiasValue = () => {
    switch (biasStatus) {
      case "low":
        return 0.25; // 25%
      case "moderate":
        return 0.5; // 50%
      case "high":
        return 0.75; // 75%
      default:
        return 0.25;
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return {
          width: 60,
          height: 40,
          fontSize: "10px",
          marginTop: -5,
        };
      case "md":
        return {
          width: 80,
          height: 50,
          fontSize: "12px",
          marginTop: -8,
        };
      case "lg":
        return {
          width: 120,
          height: 75,
          fontSize: "14px",
          marginTop: -12,
        };
      default:
        return {
          width: 80,
          height: 50,
          fontSize: "12px",
          marginTop: -8,
        };
    }
  };

  // Normalize score if provided: accept 0-1 or 0-100
  const normalizedScore =
    typeof scorePercent === "number"
      ? Math.max(
          0,
          Math.min(1, scorePercent > 1 ? scorePercent / 100 : scorePercent)
        )
      : undefined;

  const value =
    typeof normalizedScore === "number" ? normalizedScore : getBiasValue();
  const { width, height, fontSize, marginTop } = getSizeConfig();

  // Define color segments for the gauge
  // Color segments left→right must correspond to low→high percent
  // Thresholds: <60% (red), 60–79% (amber), ≥80% (green)
  const colors = ["#ef4444", "#f59e0b", "#10b981"]; // red, amber, green
  const arcsLength = [0.6, 0.19, 0.21];

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center ${
        isHighlighted ? "ring-2 ring-red-500 rounded-full p-1" : ""
      }`}
      style={{ width, height: height + (showLabel ? 20 : 0) }}
    >
      <div style={{ marginTop }}>
        <GaugeChart
          id={`gauge-${Math.random()}`}
          nrOfLevels={3}
          arcsLength={arcsLength}
          colors={colors}
          arcWidth={0.3}
          percent={value}
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
            {Math.round(value * 100)}%
          </span>
          <span className="text-gray-500 text-xs capitalize">
            {typeof normalizedScore === "number" ? "suitability" : biasStatus}
          </span>
        </div>
      )}
    </div>
  );
};
