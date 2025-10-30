import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Edit,
  LogOut,
  Shield,
  Users,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "@/utils/config/baseUrl";
import TitleTag from "@/components/shared/tag/tag";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

interface PasswordData {
  current: string;
  new: string;
  confirm: string;
}

// interface Notification {
//   id: number;
//   message: string;
//   type: "success" | "error";
// }

interface EditingState {
  personal: boolean;
  email: boolean;
}

type TeamRole = "Admin" | "Editor" | "Viewer";
type TeamStatus = "Active" | "Invited" | "Deactivated";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamStatus;
}

export default function AccountPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "team">(
    "profile"
  );
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<EditingState>({
    personal: false,
    email: false,
  });

  const [userData, setUserData] = useState<UserData>({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as UserData;
      setUserData(parsedUser);
    }
  }, []);

  const [editData, setEditData] = useState<UserData>({ ...userData });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current: "",
    new: "",
    confirm: "",
  });

  // Team state (mocked locally; replace with API calls when available)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: "2",
      name: "Taylor Reed",
      email: "taylor@example.com",
      role: "Editor",
      status: "Active",
    },
    {
      id: "3",
      name: "Sam Park",
      email: "sam@example.com",
      role: "Viewer",
      status: "Invited",
    },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("Viewer");
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateAvatar = (name: string): string => {
    const seed = name.toLowerCase().replace(/\s+/g, "");
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  // const showNotification = (message: string, type: "success" | "error" = "success"): void => {
  //   const id = Date.now();
  //   const notification: Notification = { id, message, type };
  //   setNotifications((prev) => [...prev, notification]);
  //   setTimeout(() => {
  //     setNotifications((prev) => prev.filter((n) => n.id !== id));
  //   }, 3000);
  // };

  const handleEdit = (section: keyof EditingState): void => {
    setIsEditing((prev) => ({ ...prev, [section]: true }));
    setEditData({ ...userData });
  };

  const handleCancel = (section: keyof EditingState): void => {
    setIsEditing((prev) => ({ ...prev, [section]: false }));
    setEditData({ ...userData });
  };

  const handleSave = async (section: keyof EditingState): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (section === "personal") {
        setUserData((prev) => ({
          ...prev,
          firstName: editData.firstName,
          lastName: editData.lastName,
          phoneNumber: editData.phoneNumber,
        }));
        // showNotification("Personal information updated successfully!");
      } else if (section === "email") {
        setUserData((prev) => ({ ...prev, email: editData.email }));
        // showNotification("Email address updated successfully!");
      }

      setIsEditing((prev) => ({ ...prev, [section]: false }));
    } catch (error: unknown) {
      console.error("Error updating information:", error);
      // showNotification("Failed to update information", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (): Promise<void> => {
    if (passwordData.new !== passwordData.confirm) {
      // showNotification("New passwords don't match", "error");
      return;
    }

    if (passwordData.new.length < 8) {
      // showNotification("Password must be at least 8 characters long", "error");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // showNotification("Password updated successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      // showNotification("Failed to update password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserData, value: string): void => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (
    field: keyof PasswordData,
    value: string
  ): void => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const logoutUser = (): void => {
    try {
      navigate("/");
      setTimeout(() => {
        handleLogout();
      }, 500);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const inviteMember = (): void => {
    if (!inviteEmail) return;
    const nameFromEmail = inviteEmail.split("@")[0];
    const member: TeamMember = {
      id: String(Date.now()),
      name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
      email: inviteEmail,
      role: inviteRole,
      status: "Invited",
    };
    setTeamMembers((prev) => [member, ...prev]);
    setInviteEmail("");
    setInviteRole("Viewer");
  };

  const changeMemberRole = (id: string, role: TeamRole): void => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role } : m))
    );
  };

  const deactivateMember = (id: string): void => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "Deactivated" } : m))
    );
  };

  const reactivateMember = (id: string): void => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "Active" } : m))
    );
  };

  const removeMember = (id: string): void => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 lg:px-8">
      <TitleTag title="Account" />
      <div className="h-6" />

      {/* Header */}
      <Card className="mb-6 border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-24 w-full" />
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <Avatar className="h-20 w-20 ring-4 ring-white">
              <AvatarImage
                src={generateAvatar(
                  `${userData.firstName} ${userData.lastName}`
                )}
                alt={`${userData.firstName} ${userData.lastName}`}
              />
              <AvatarFallback className="bg-blue-600 text-white text-xl">
                {userData.firstName?.[0]}
                {userData.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-2xl font-semibold">
                {userData.firstName} {userData.lastName}
              </div>
              <div className="text-gray-500 flex items-center gap-2">
                <Mail className="h-4 w-4" /> {userData.email}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={logoutUser}>
                <LogOut className="h-4 w-4" />
                <span className="ml-2">Log out</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList className="bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-blue-50"
          >
            <User className="h-4 w-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-blue-50">
            <Users className="h-4 w-4 mr-2" /> Team
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-blue-50"
          >
            <Shield className="h-4 w-4 mr-2" /> Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your name and phone number.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isEditing.personal ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        First Name
                      </div>
                      <div className="font-medium">{userData.firstName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Last Name
                      </div>
                      <div className="font-medium">{userData.lastName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Phone Number
                      </div>
                      <div className="font-medium">{userData.phoneNumber}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium"
                      >
                        First Name
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          value={editData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          value={editData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label
                        htmlFor="phoneNumber"
                        className="text-sm font-medium"
                      >
                        Phone Number
                      </Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phoneNumber"
                          value={editData.phoneNumber}
                          onChange={(e) =>
                            handleInputChange("phoneNumber", e.target.value)
                          }
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="px-6 pb-6">
                {!isEditing.personal ? (
                  <Button
                    variant="outline"
                    onClick={() => handleEdit("personal")}
                  >
                    {<Edit className="h-4 w-4 mr-2" />}Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave("personal")}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCancel("personal")}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
                <CardDescription>Your account email address.</CardDescription>
              </CardHeader>
              <CardContent>
                {!isEditing.email ? (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      Email Address
                    </div>
                    <div className="font-medium break-all">
                      {userData.email}
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={editData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
              <div className="px-6 pb-6">
                {!isEditing.email ? (
                  <Button variant="outline" onClick={() => handleEdit("email")}>
                    {<Edit className="h-4 w-4 mr-2" />}Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSave("email")}
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCancel("email")}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Invite a team member</CardTitle>
                  <CardDescription>
                    Collaborate by inviting teammates.
                  </CardDescription>
                </div>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                  <DialogTrigger asChild>
                    <Button size="icon" aria-label="Invite member">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite a team member</DialogTitle>
                      <DialogDescription>
                        Send an invitation email to add a new member.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label
                          htmlFor="inviteEmail"
                          className="text-sm font-medium"
                        >
                          Email Address
                        </Label>
                        <Input
                          id="inviteEmail"
                          placeholder="name@example.com"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() => {
                          inviteMember();
                          if (inviteEmail) setIsInviteOpen(false);
                        }}
                        disabled={!inviteEmail}
                        className="w-full"
                      >
                        Send Invite
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team members</CardTitle>
              <CardDescription>
                Manage roles and access to your workspace.
              </CardDescription>
            </CardHeader>
            <div className="grid grid-cols-12 gap-0 px-6 py-3 text-xs font-medium text-gray-500 border-b bg-gray-50">
              <div className="col-span-4">Member</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            <div className="divide-y">
              {teamMembers.map((m) => (
                <div
                  key={m.id}
                  className="grid grid-cols-12 items-center px-6 py-4"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={generateAvatar(m.name)} alt={m.name} />
                      <AvatarFallback>{m.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{m.name}</div>
                  </div>
                  <div className="col-span-3 text-gray-600">{m.email}</div>
                  <div className="col-span-2">
                    {m.status === "Active" && (
                      <Badge className="bg-green-100 text-green-700 border border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" /> Active
                      </Badge>
                    )}
                    {m.status === "Invited" && (
                      <Badge className="bg-blue-100 text-blue-700 border border-blue-200">
                        <Mail className="h-3 w-3 mr-1" /> Invited
                      </Badge>
                    )}
                    {m.status === "Deactivated" && (
                      <Badge className="bg-gray-100 text-gray-700 border border-gray-200">
                        <XCircle className="h-3 w-3 mr-1" /> Deactivated
                      </Badge>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Select
                      value={m.role}
                      onValueChange={(v: TeamRole) => changeMemberRole(m.id, v)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Editor">Editor</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {m.status !== "Deactivated" ? (
                        <Button
                          variant="outline"
                          size="icon"
                          title="Deactivate"
                          onClick={() => deactivateMember(m.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          title="Reactivate"
                          onClick={() => reactivateMember(m.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        title="Remove"
                        onClick={() => removeMember(m.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Ensure your account remains secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="currentPassword"
                  className="text-sm font-medium"
                >
                  Current Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) =>
                      handlePasswordChange("current", e.target.value)
                    }
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) =>
                      handlePasswordChange("new", e.target.value)
                    }
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm New Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) =>
                      handlePasswordChange("confirm", e.target.value)
                    }
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Password Requirements</p>
                    <ul className="text-xs space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Include at least one number</li>
                      <li>• Include at least one special character</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={handlePasswordUpdate}
                disabled={
                  isLoading ||
                  !passwordData.current ||
                  !passwordData.new ||
                  !passwordData.confirm
                }
                className="w-full"
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
