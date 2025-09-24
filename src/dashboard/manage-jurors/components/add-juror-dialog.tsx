/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, X } from "lucide-react";
import type { Juror } from "./types";

interface AddJurorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (juror: Juror) => void;
  selectedCase: any | null;
}

export function AddJurorDialog({
  isOpen,
  onClose,
  onSave,
  selectedCase,
}: AddJurorDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");

  const initialJuror: Partial<Juror> = {
    id: `manual-${Date.now()}`,
    name: "",
    age: 0,
    occupation: "",
    education: "",
    experience: "",
    location: "",
    availability: "Available",
    email: "",
    phone: "",
    address: "",
    biasStatus: "low",
    caseId: selectedCase?.id || "",
    dateOfBirth: "",
    race: "",
    gender: "",
    employer: "",
    maritalStatus: "",
    citizenship: "Yes",
    county: "",
    tdl: "",
    workPhone: "",
    employmentDuration: "",
    children: "",
    panelPosition: "",
    jurorNumber: `M-${Math.floor(1000 + Math.random() * 9000)}`,
    criminalCase: "No",
    accidentalInjury: "No",
    civilJury: "No",
    criminalJury: "No",
    spouse: "",
    mailingAddress: "",
  };

  const [newJuror, setNewJuror] = useState<Partial<Juror>>(initialJuror);

  const handleInputChange = (field: keyof Juror, value: any) => {
    setNewJuror((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Basic validation - only require name
    if (!newJuror.name || newJuror.name.trim() === "") {
      alert("Please enter a name for the juror");
      return;
    }

    if (!selectedCase) {
      alert("Please select a case first");
      return;
    }

    // Create a complete juror object with all required fields
    const completeJuror = {
      ...initialJuror,
      ...newJuror,
      caseId: selectedCase.id,
      id: `manual-${Date.now()}`, // Ensure unique ID
      name: newJuror.name.trim(), // Clean the name
    } as Juror;

    onSave(completeJuror);

    // Reset form and close dialog
    setNewJuror(initialJuror);
    setActiveTab("basic");
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setNewJuror(initialJuror);
    setActiveTab("basic");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden sm:rounded-2xl border-0 shadow-2xl ">
        <DialogHeader>
          <div className="flex items-center justify-between p-3 rounded-xl ">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Add New Juror
            </DialogTitle>
          </div>
          <DialogDescription>
            Manually add a new juror to{" "}
            {selectedCase?.name || "the selected case"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4 p-1 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10">
            <TabsTrigger
              value="basic"
              className="rounded-lg data-[state=active]:text-white data-[state=active]:shadow data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600"
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              className="rounded-lg data-[state=active]:text-white data-[state=active]:shadow data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600"
            >
              Personal Details
            </TabsTrigger>
            <TabsTrigger
              value="experience"
              className="rounded-lg data-[state=active]:text-white data-[state=active]:shadow data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600"
            >
              Experience
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] pr-4">
            <TabsContent value="basic" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={newJuror.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="John Doe"
                    className="border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jurorNumber">Juror Number</Label>
                  <Input
                    id="jurorNumber"
                    value={newJuror.jurorNumber || ""}
                    onChange={(e) =>
                      handleInputChange("jurorNumber", e.target.value)
                    }
                    placeholder="J-1234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newJuror.age || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "age",
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="35"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={newJuror.gender || ""}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Prefer not to say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newJuror.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newJuror.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={newJuror.occupation || ""}
                    onChange={(e) =>
                      handleInputChange("occupation", e.target.value)
                    }
                    placeholder="Software Engineer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer">Employer</Label>
                  <Input
                    id="employer"
                    value={newJuror.employer || ""}
                    onChange={(e) =>
                      handleInputChange("employer", e.target.value)
                    }
                    placeholder="Acme Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biasStatus">Risk Level</Label>
                  <Select
                    value={newJuror.biasStatus || "low"}
                    onValueChange={(value: "low" | "moderate" | "high") =>
                      handleInputChange("biasStatus", value)
                    }
                  >
                    <SelectTrigger id="biasStatus">
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="moderate">Moderate Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select
                    value={newJuror.availability || "Available"}
                    onValueChange={(value) =>
                      handleInputChange("availability", value)
                    }
                  >
                    <SelectTrigger id="availability">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Limited">Limited</SelectItem>
                      <SelectItem value="Unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="personal" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newJuror.dateOfBirth || ""}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="race">Race/Ethnicity</Label>
                  <Input
                    id="race"
                    value={newJuror.race || ""}
                    onChange={(e) => handleInputChange("race", e.target.value)}
                    placeholder="Caucasian, African American, Hispanic, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Home Address</Label>
                  <Input
                    id="address"
                    value={newJuror.address || ""}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="123 Main St, Anytown, ST 12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mailingAddress">Mailing Address</Label>
                  <Input
                    id="mailingAddress"
                    value={newJuror.mailingAddress || ""}
                    onChange={(e) =>
                      handleInputChange("mailingAddress", e.target.value)
                    }
                    placeholder="Same as home address or different"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    value={newJuror.county || ""}
                    onChange={(e) =>
                      handleInputChange("county", e.target.value)
                    }
                    placeholder="County of residence"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newJuror.location || ""}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="City, State"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tdl">Driver's License #</Label>
                  <Input
                    id="tdl"
                    value={newJuror.tdl || ""}
                    onChange={(e) => handleInputChange("tdl", e.target.value)}
                    placeholder="DL12345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workPhone">Work Phone</Label>
                  <Input
                    id="workPhone"
                    value={newJuror.workPhone || ""}
                    onChange={(e) =>
                      handleInputChange("workPhone", e.target.value)
                    }
                    placeholder="(555) 987-6543"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select
                    value={newJuror.maritalStatus || ""}
                    onValueChange={(value) =>
                      handleInputChange("maritalStatus", value)
                    }
                  >
                    <SelectTrigger id="maritalStatus">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                      <SelectItem value="Separated">Separated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spouse">Spouse Name</Label>
                  <Input
                    id="spouse"
                    value={newJuror.spouse || ""}
                    onChange={(e) =>
                      handleInputChange("spouse", e.target.value)
                    }
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="experience" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    value={newJuror.education || ""}
                    onChange={(e) =>
                      handleInputChange("education", e.target.value)
                    }
                    placeholder="Bachelor's Degree in Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    value={newJuror.experience || ""}
                    onChange={(e) =>
                      handleInputChange("experience", e.target.value)
                    }
                    placeholder="5 years in software development"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentDuration">
                    Employment Duration
                  </Label>
                  <Input
                    id="employmentDuration"
                    value={newJuror.employmentDuration || ""}
                    onChange={(e) =>
                      handleInputChange("employmentDuration", e.target.value)
                    }
                    placeholder="2 years"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="children">Number of Children</Label>
                  <Input
                    id="children"
                    value={newJuror.children || ""}
                    onChange={(e) =>
                      handleInputChange("children", e.target.value)
                    }
                    placeholder="2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="panelPosition">Panel Position</Label>
                  <Input
                    id="panelPosition"
                    value={newJuror.panelPosition || ""}
                    onChange={(e) =>
                      handleInputChange("panelPosition", e.target.value)
                    }
                    placeholder="Lead Juror"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="citizenship">Citizenship</Label>
                  <Select
                    value={newJuror.citizenship || "Yes"}
                    onValueChange={(value) =>
                      handleInputChange("citizenship", value)
                    }
                  >
                    <SelectTrigger id="citizenship">
                      <SelectValue placeholder="Select citizenship status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Citizen</SelectItem>
                      <SelectItem value="No">Non-Citizen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="criminalCase">Criminal Case Experience</Label>
                  <Select
                    value={newJuror.criminalCase || "No"}
                    onValueChange={(value) =>
                      handleInputChange("criminalCase", value)
                    }
                  >
                    <SelectTrigger id="criminalCase">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accidentalInjury">
                    Accidental Injury Experience
                  </Label>
                  <Select
                    value={newJuror.accidentalInjury || "No"}
                    onValueChange={(value) =>
                      handleInputChange("accidentalInjury", value)
                    }
                  >
                    <SelectTrigger id="accidentalInjury">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="civilJury">Civil Jury Experience</Label>
                  <Select
                    value={newJuror.civilJury || "No"}
                    onValueChange={(value) =>
                      handleInputChange("civilJury", value)
                    }
                  >
                    <SelectTrigger id="civilJury">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="criminalJury">Criminal Jury Experience</Label>
                  <Select
                    value={newJuror.criminalJury || "No"}
                    onValueChange={(value) =>
                      handleInputChange("criminalJury", value)
                    }
                  >
                    <SelectTrigger id="criminalJury">
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Save and Cancel Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            className="border-2 border-red-200 text-red-700 hover:text-red-50 hover:bg-red-500/80 hover:border-red-500"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 shadow-md"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Juror
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
