import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Calendar, Briefcase, GraduationCap, MapPin, User, Mail, Phone, Home, Building, Heart, Users, Flag, Car, Wrench, BookOpen, Shield, Edit, Save, X, Loader2 } from "lucide-react";
import type { Juror } from "./types";
import { generateAvatar } from "./utils";
import { updateJurorApi } from "@/api/api";
import { toast } from "sonner";

interface ManageJurorDetailsModalProps {
  juror: Juror | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedJuror: Juror) => void;
}

export function ManageJurorDetailsModal({ juror, isOpen, onClose, onUpdate }: ManageJurorDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJuror, setEditedJuror] = useState<Partial<Juror>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (juror) {
      setEditedJuror(juror);
      setIsEditing(false);
    }
  }, [juror]);

  if (!juror) return null;

  const jurorInitials = (editedJuror.name || juror.name)
    .split(" ")
    .map((n) => n[0])
    .join("");

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedJuror(juror);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!juror.id) return;
    
    setIsSaving(true);
    try {
      const response = await updateJurorApi(juror.id, editedJuror);
      if (response.success) {
        toast.success("Juror updated successfully");
        setIsEditing(false);
        if (onUpdate) {
          onUpdate(response.data as Juror);
        }
      }
    } catch (error: any) {
      console.error("Error updating juror:", error);
      toast.error(error.response?.data?.error || "Failed to update juror");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof Juror, value: any) => {
    setEditedJuror((prev) => ({ ...prev, [field]: value }));
  };

  const displayValue = (field: keyof Juror) => {
    return editedJuror[field] || juror[field] || "Not specified";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-white mx-4 [&>button]:hover:bg-gray-100 [&>button]:hover:scale-110 [&>button]:transition-all [&>button]:duration-200 [&>button]:rounded-md [&>button]:p-1.5">
        <DialogHeader className="pr-16">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Juror Profile Details
            </DialogTitle>
            <div className="flex items-center gap-4">
              {!isEditing ? (
                <Button 
                  onClick={handleEdit} 
                  variant="outline" 
                  size="sm"
                  className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline" 
                    size="sm" 
                    disabled={isSaving}
                    className="border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    size="sm" 
                    disabled={isSaving}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 hover:scale-105 disabled:hover:scale-100"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
          <DialogDescription>Complete juror information and profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with juror basic info */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="relative">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-white shadow-md">
                <AvatarImage src={generateAvatar(juror.name, juror.gender) || "/placeholder.svg"} alt={juror.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm sm:text-lg font-semibold">
                  {jurorInitials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">{juror.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {juror.jurorNumber && (
                  <Badge variant="outline" className="font-semibold text-base sm:text-lg">#{juror.jurorNumber}</Badge>
                )}
                <Badge variant="secondary" className="text-xs">{juror.availability}</Badge>
                {juror.isStrikedOut && (
                  <Badge variant="destructive" className="text-xs">STRUCK</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Age</p>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedJuror.age || ""}
                        onChange={(e) => handleFieldChange("age", parseInt(e.target.value) || 0)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("age")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Gender</p>
                    {isEditing ? (
                      <Select
                        value={editedJuror.gender || ""}
                        onValueChange={(value) => handleFieldChange("gender", value)}
                      >
                        <SelectTrigger className="text-base mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-base">{displayValue("gender")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Flag className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Race</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror.race || ""}
                        onChange={(e) => handleFieldChange("race", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("race")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Marital Status</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror.maritalStatus || ""}
                        onChange={(e) => handleFieldChange("maritalStatus", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("maritalStatus")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Children</p>
                    <p className="text-base">{juror.children || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Citizenship</p>
                    <p className="text-base">{juror.citizenship || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">County</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror.county || ""}
                        onChange={(e) => handleFieldChange("county", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("county")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Car className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Driver's License</p>
                    <p className="text-base">{juror.tdl || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Occupation</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror.occupation || ""}
                        onChange={(e) => handleFieldChange("occupation", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("occupation")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Employer</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror.employer || ""}
                        onChange={(e) => handleFieldChange("employer", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("employer")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Employment Duration</p>
                    <p className="text-base">{juror.employmentDuration || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Education</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror.education || ""}
                        onChange={(e) => handleFieldChange("education", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("education")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Jury Experience</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror.experience || ""}
                        onChange={(e) => handleFieldChange("experience", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("experience")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Location</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror.location || ""}
                        onChange={(e) => handleFieldChange("location", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("location")}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Email</p>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editedJuror.email || ""}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("email")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Phone</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror.phone || ""}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("phone")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Work Phone</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror.workPhone || ""}
                        onChange={(e) => handleFieldChange("workPhone", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("workPhone")}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Address</p>
                    {isEditing ? (
                      <Input
                        value={editedJuror.address || ""}
                        onChange={(e) => handleFieldChange("address", e.target.value)}
                        className="text-base mt-1"
                      />
                    ) : (
                      <p className="text-base">{displayValue("address")}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Legal & Jury History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Flag className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Criminal Cases</p>
                    <p className="text-base">{juror.criminalCase || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Accidental Injury</p>
                    <p className="text-base">{juror.accidentalInjury || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Civil Jury</p>
                    <p className="text-base">{juror.civilJury || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Criminal Jury</p>
                    <p className="text-base">{juror.criminalJury || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Panel Position</p>
                    <p className="text-base">{juror.panelPosition || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Spouse</p>
                    <p className="text-base">{juror.spouse || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Mailing Address</p>
                    <p className="text-base">{juror.mailingAddress || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Date of Birth</p>
                    <p className="text-base">{juror.dateOfBirth || "Not specified"}</p>
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
