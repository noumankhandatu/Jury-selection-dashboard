/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaRotateLeft } from "react-icons/fa6";

const generateAvatar = (name: any) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
};

const CourtroomLayout = ({ allJurors = [] }: any) => {
  const [benchAbove, setBenchAbove] = useState(false);

  const renderJurorSeat = (juror: any) => (
    <div
      key={juror.id}
      className="flex flex-col items-center justify-center space-y-1 p-2 bg-white rounded-md shadow-sm border border-gray-200 hover:shadow-md transition"
    >
      <Avatar className="h-10 w-10 border-2 border-white shadow">
        <AvatarImage src={generateAvatar(juror.name)} alt={juror.name} />
        <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-semibold">
          {juror.name
            .split(" ")
            .map((n: any) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <span className="text-xs font-medium text-gray-700 text-center">{juror.name}</span>
    </div>
  )

  const renderJuryCluster = (startIndex: any, clusterNumber: any) => {
    const clusterJurors = allJurors.slice(startIndex, startIndex + 6)

    return (
      <div key={`cluster-${clusterNumber}`} className="bg-white rounded-lg border border-gray-200 shadow p-4 group">
        <div className="text-center mb-3">
          <Badge variant="outline" className="text-xs font-medium">
            Box {clusterNumber}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-3">{clusterJurors.map((juror: any) => renderJurorSeat(juror))}</div>
      </div>
    )
  }

  const judgeBench = (
    <div className="flex justify-center my-8">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-4 rounded-lg shadow-lg text-center">
        <div className="text-lg font-bold">JUDGE'S BENCH</div>
        <div className="text-xs opacity-75 mt-1">Honorable Court</div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-slate-100 p-6 rounded-lg h-screen overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">U.S. Courtroom Jury Box Layout</h2>
          <p className="text-sm text-gray-600">36 Jurors • 6 Boxes • 6 Seats per Box</p>
        </div>
        <button
          type="button"
          onClick={() => setBenchAbove((prev) => !prev)}
          className="p-2 rounded hover:bg-gray-200 transition"
          aria-label="Toggle Judge's Bench Position"
        >
          <FaRotateLeft />
        </button>
      </div>

      {/* If benchAbove, show bench above grid and hide grid. If not, show grid then bench below */}
      {/* Render judgeBench and jury grid based on benchAbove */}
      <div className="flex flex-col gap-6">
        {benchAbove && judgeBench}
        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: 6 }, (_, i) => renderJuryCluster(i * 6, i + 1))}
        </div>
        {!benchAbove && judgeBench}
      </div>
    </div>
  )
}

export default CourtroomLayout
