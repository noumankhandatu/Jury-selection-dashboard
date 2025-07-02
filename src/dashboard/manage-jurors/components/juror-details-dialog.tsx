import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Juror } from "./types";
import { generateAvatar } from "./utils";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { BiasGauge } from "@/components/shared/bias-gauge";

interface JurorDetailsDialogProps {
  juror: Juror | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedJuror: Juror) => void;
}

export function JurorDetailsDialog({ juror, isOpen, onClose, onSave }: JurorDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJuror, setEditedJuror] = useState<Juror | null>(null);

  useEffect(() => {
    if (juror) {
      setEditedJuror({ ...juror });
    }
  }, [juror]);

  const handleSave = () => {
    if (editedJuror && onSave) {
      onSave(editedJuror);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedJuror(juror ? { ...juror } : null);
    setIsEditing(false);
  };

  if (!juror) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white mx-4" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Juror Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button variant="outline" className="mt-4 bg-primary text-white" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
          <DialogDescription>Complete information from juror questionnaire</DialogDescription>
        </DialogHeader>

        <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
          {/* Header with juror basic info */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="relative">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-white shadow-md">
                <AvatarImage src={generateAvatar(juror.name) || "/placeholder.svg"} alt={juror.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm sm:text-lg font-semibold">
                  {juror.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-2 -right-2">
                <BiasGauge biasStatus={juror.isStrikedOut ? "low" : juror.biasStatus} size="md" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">{juror.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Badge variant="outline" className="font-medium text-xs">
                  Juror #{juror.jurorNumber}
                </Badge>
                {juror.isStrikedOut && (
                  <Badge variant="destructive" className="text-xs">
                    STRUCK
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Complete juror information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Complete Juror Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Juror #</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.jurorNumber || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, jurorNumber: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.jurorNumber}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Name</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.name || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.name}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Gender</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.gender || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, gender: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.gender}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Race</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.race || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, race: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.race}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Date of Birth</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.dateOfBirth || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, dateOfBirth: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Home Address</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.address || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, address: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.address}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Mailing Address</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.mailingAddress || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, mailingAddress: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.mailingAddress}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">TDL#</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.tdl || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, tdl: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.tdl}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Home Phone</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.phone || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.phone}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">County of Residence</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.county || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, county: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.county}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Criminal Case Experience</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.criminalCase || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, criminalCase: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.criminalCase}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Accidental Injury</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.accidentalInjury || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, accidentalInjury: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.accidentalInjury}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Education</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.education || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, education: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.education}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Civil Jury Service</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.civilJury || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, civilJury: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.civilJury}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Criminal Jury Service</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.criminalJury || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, criminalJury: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.criminalJury}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">U.S. Citizen</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.citizenship || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, citizenship: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.citizenship}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Occupation</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.occupation || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, occupation: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.occupation}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Work Phone</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.workPhone || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, workPhone: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.workPhone}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Marital Status</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.maritalStatus || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, maritalStatus: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.maritalStatus}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Spouse</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.spouse || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, spouse: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.spouse}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Employer</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.employer || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, employer: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.employer}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Length of Employment</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.employmentDuration || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, employmentDuration: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.employmentDuration}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Children</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.children || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, children: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.children}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700">Panel Position</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror?.panelPosition || ""}
                        onChange={(e) => setEditedJuror((prev) => (prev ? { ...prev, panelPosition: e.target.value } : null))}
                      />
                    ) : (
                      <p className="text-base">{juror.panelPosition}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
