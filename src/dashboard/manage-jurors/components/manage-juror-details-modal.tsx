import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Calendar, Briefcase, GraduationCap, MapPin, User, Mail, Phone, Home, Building, Heart, Users, Flag, Car, Wrench, BookOpen, Shield } from "lucide-react";
import type { Juror } from "./types";
import { generateAvatar } from "./utils";

interface ManageJurorDetailsModalProps {
  juror: Juror | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ManageJurorDetailsModal({ juror, isOpen, onClose }: ManageJurorDetailsModalProps) {
  if (!juror) return null;

  const jurorInitials = juror.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white mx-4">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              Juror Profile Details
            </DialogTitle>
          </div>
          <DialogDescription>Complete juror information and profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with juror basic info */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <div className="relative">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-white shadow-md">
                <AvatarImage src={generateAvatar(juror.name) || "/placeholder.svg"} alt={juror.name} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm sm:text-lg font-semibold">
                  {jurorInitials}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold truncate">{juror.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {juror.jurorNumber && (
                  <Badge variant="outline" className="font-medium text-xs">Juror #{juror.jurorNumber}</Badge>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Age</p>
                    <p className="text-base">{juror.age} years old</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-pink-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Gender</p>
                    <p className="text-base">{juror.gender || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Flag className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Race</p>
                    <p className="text-base">{juror.race || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Marital Status</p>
                    <p className="text-base">{juror.maritalStatus || "Not specified"}</p>
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
                  <div>
                    <p className="text-sm font-semibold text-gray-700">County</p>
                    <p className="text-base">{juror.county || "Not specified"}</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Occupation</p>
                    <p className="text-base">{juror.occupation || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Employer</p>
                    <p className="text-base">{juror.employer || "Not specified"}</p>
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
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Education</p>
                    <p className="text-base">{juror.education}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Jury Experience</p>
                    <p className="text-base">{juror.experience}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Location</p>
                    <p className="text-base">{juror.location}</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Email</p>
                    <p className="text-base">{juror.email || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Phone</p>
                    <p className="text-base">{juror.phone || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wrench className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Work Phone</p>
                    <p className="text-base">{juror.workPhone || "Not specified"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Address</p>
                    <p className="text-base">{juror.address || "Not specified"}</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
