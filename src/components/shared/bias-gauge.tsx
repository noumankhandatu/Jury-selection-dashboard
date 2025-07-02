import type React from "react";
import GaugeChart from "react-gauge-chart";

interface BiasGaugeProps {
  biasStatus: "low" | "moderate" | "high";
  size?: "sm" | "md" | "lg";
  isHighlighted?: boolean;
  showLabel?: boolean;
}

export const BiasGauge: React.FC<BiasGaugeProps> = ({ biasStatus, size = "md", isHighlighted = false, showLabel = true }) => {
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

  const value = getBiasValue();
  const { width, height, fontSize, marginTop } = getSizeConfig();

  // Define color segments for the gauge
  const colors = ["#10b981", "#f59e0b", "#ef4444"]; // green, amber, red

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center ${isHighlighted ? "ring-2 ring-red-500 rounded-full p-1" : ""}`}
      style={{ width, height: height + (showLabel ? 20 : 0) }}
    >
      <div style={{ marginTop }}>
        <GaugeChart
          id={`gauge-${Math.random()}`}
          nrOfLevels={3}
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
        <div className="absolute bottom-0 flex flex-col items-center" style={{ fontSize }}>
          <span className="font-bold text-gray-700">{Math.round(value * 100)}%</span>
          <span className="text-gray-500 text-xs capitalize">{biasStatus}</span>
        </div>
      )}
    </div>
  );
};
