import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StickyNote, X } from "lucide-react";

interface Juror {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  seatNumber: number;
}

interface Note {
  id: string;
  content: string;
  timestamp: string;
  author: string;
}

interface JuryPoolGridProps {
  jurors: Juror[];
  selectedJurors: string[];
  struckJurors: string[];
  jurorNotes: Record<string, Note[]>;
  onJurorSelect: (jurorId: string) => void;
  onStrikeJuror: (jurorId: string) => void;
  onAddNote: (jurorId: string) => void;
  sessionActive: boolean;
}

export default function JuryPoolGrid({
  jurors,
  selectedJurors,
  struckJurors,
  jurorNotes,
  onJurorSelect,
  onStrikeJuror,
  onAddNote,
  sessionActive,
}: JuryPoolGridProps) {
  // Generate 36 jurors if we don't have enough
  const generateJurors = () => {
    const baseJurors = [...jurors];
    const names = [
      "John Smith",
      "Sarah Johnson",
      "Mike Davis",
      "Lisa Wilson",
      "David Brown",
      "Emily Chen",
      "Robert Garcia",
      "Maria Rodriguez",
      "James Miller",
      "Jennifer Taylor",
      "Michael Anderson",
      "Jessica Thomas",
      "Christopher Jackson",
      "Amanda White",
      "Daniel Harris",
      "Ashley Martin",
      "Matthew Thompson",
      "Samantha Garcia",
      "Andrew Wilson",
      "Nicole Moore",
      "Joshua Taylor",
      "Stephanie Anderson",
      "Ryan Thomas",
      "Michelle Jackson",
      "Brandon White",
      "Kimberly Harris",
      "Justin Martin",
      "Rachel Thompson",
      "Kevin Garcia",
      "Lauren Wilson",
      "Tyler Moore",
      "Brittany Taylor",
      "Jonathan Anderson",
      "Megan Thomas",
      "Nicholas Jackson",
      "Alexis White",
    ];

    const occupations = [
      "Teacher",
      "Nurse",
      "Engineer",
      "Accountant",
      "Manager",
      "Sales Rep",
      "Mechanic",
      "Lawyer",
      "Doctor",
      "Architect",
      "Designer",
      "Chef",
      "Electrician",
      "Plumber",
      "Writer",
      "Artist",
      "Consultant",
      "Analyst",
      "Technician",
      "Supervisor",
      "Coordinator",
      "Specialist",
      "Assistant",
      "Director",
      "Administrator",
      "Clerk",
      "Officer",
      "Inspector",
      "Operator",
      "Contractor",
      "Instructor",
      "Counselor",
      "Therapist",
      "Pharmacist",
      "Librarian",
      "Banker",
    ];

    while (baseJurors.length < 36) {
      const index = baseJurors.length;
      baseJurors.push({
        id: `juror-${index + 1}`,
        name: names[index] || `Juror ${index + 1}`,
        age: Math.floor(Math.random() * 40) + 25, // Ages 25-65
        occupation: occupations[index] || "Professional",
        location: "District",
        seatNumber: index + 1,
      });
    }

    return baseJurors.slice(0, 36);
  };

  const allJurors = generateJurors();

  const getJurorStatus = (jurorId: string) => {
    if (struckJurors.includes(jurorId)) return "struck";
    if (selectedJurors.includes(jurorId)) return "selected";
    return "available";
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-green-50 border-green-300 hover:bg-green-100";
      case "struck":
        return "bg-red-50 border-red-300 opacity-70";
      default:
        return "bg-blue-50 border-blue-300 hover:bg-blue-100";
    }
  };

  const generateAvatar = (name: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  };

  const renderJurorSeat = (juror: Juror) => {
    const status = getJurorStatus(juror.id);
    const hasNotes = jurorNotes[juror.id]?.length > 0;

    return (
      <div
        key={juror.id}
        className={`relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${getStatusStyles(status)} ${
          sessionActive && status !== "struck" ? "hover:shadow-md" : ""
        }`}
        onClick={() => sessionActive && status !== "struck" && onJurorSelect(juror.id)}
      >
        {/* Seat Number */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-slate-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
          {juror.seatNumber}
        </div>

        {/* Status Indicators */}
        {status === "selected" && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center">✓</div>
        )}

        {status === "struck" && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center">✗</div>
        )}

        {/* Notes Indicator */}
        {hasNotes && (
          <div className="absolute top-1 right-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        )}

        {/* Juror Avatar */}
        <div className="flex justify-center mb-2">
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src={generateAvatar(juror.name) || "/placeholder.svg"} alt={juror.name} />
            <AvatarFallback className="bg-gray-200 text-gray-700 text-xs font-semibold">
              {juror.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Juror Info */}
        <div className="text-center space-y-1">
          <h3 className={`font-medium text-xs leading-tight ${status === "struck" ? "line-through text-gray-500" : ""}`}>{juror.name}</h3>
          <p className="text-xs text-gray-600">Age {juror.age}</p>
          <p className="text-xs text-gray-500 truncate">{juror.occupation}</p>
        </div>

        {/* Action Buttons */}
        {sessionActive && status !== "struck" && (
          <div className="flex justify-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddNote(juror.id);
              }}
              className="h-5 w-5 p-0 hover:bg-blue-100"
              title="Add note"
            >
              <StickyNote className="h-3 w-3 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onStrikeJuror(juror.id);
              }}
              className="h-5 w-5 p-0 hover:bg-red-100"
              title="Strike juror"
            >
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderJuryCluster = (startIndex: number, clusterNumber: number) => {
    const clusterJurors = allJurors.slice(startIndex, startIndex + 6);

    return (
      <div key={`cluster-${clusterNumber}`} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 group">
        {/* Cluster Header */}
        <div className="text-center mb-3">
          <Badge variant="outline" className="text-xs font-medium">
            Box {clusterNumber}
          </Badge>
        </div>

        {/* 2x3 Grid of Jurors */}
        <div className="grid grid-cols-3 gap-3">{clusterJurors.map((juror) => renderJurorSeat(juror))}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-slate-100 p-6 rounded-lg h-screen overflow-scroll">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">U.S. Courtroom Jury Box Layout</h2>
          <p className="text-sm text-gray-600">36 Jurors • 6 Boxes • 6 Seats per Box</p>
        </div>
      </div>

      {/* Main Jury Box Layout - 3 columns × 2 rows */}
      <div className={`grid grid-cols-2 gap-6 mx-auto transition-transform duration-500 `}>
        {/* Row 1 - Front Row Boxes */}
        {renderJuryCluster(0, 1)} {/* Box 1: Seats 1-6 */}
        {renderJuryCluster(6, 2)} {/* Box 2: Seats 7-12 */}
        {renderJuryCluster(12, 3)} {/* Box 3: Seats 13-18 */}
        {/* Row 2 - Back Row Boxes */}
        {renderJuryCluster(18, 4)} {/* Box 4: Seats 19-24 */}
        {renderJuryCluster(24, 5)} {/* Box 5: Seats 25-30 */}
        {renderJuryCluster(30, 6)} {/* Box 6: Seats 31-36 */}
      </div>

      {/* Attorney Tables Indicator */}
      {/* Judge's Bench */}
      <div className="flex justify-center mb-8">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-4 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="text-lg font-bold">JUDGE'S BENCH</div>
            <div className="text-xs opacity-75 mt-1">Honorable Court</div>
          </div>
        </div>
      </div>
    </div>
  );
}
