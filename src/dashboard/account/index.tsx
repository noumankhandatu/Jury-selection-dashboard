/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, EyeOff, Phone, Edit, LogOut, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "@/utils/config/baseUrl";
import TitleTag from "@/components/shared/tag/tag";

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

interface Notification {
  id: number;
  message: string;
  type: "success" | "error";
}

interface EditingState {
  personal: boolean;
  email: boolean;
}

export default function AccountPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
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

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateAvatar = (name: string): string => {
    const seed = name.toLowerCase().replace(/\s+/g, "");
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  const showNotification = (message: string, type: "success" | "error" = "success"): void => {
    const id = Date.now();
    const notification: Notification = { id, message, type };
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

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
        showNotification("Personal information updated successfully!");
      } else if (section === "email") {
        setUserData((prev) => ({ ...prev, email: editData.email }));
        showNotification("Email address updated successfully!");
      }

      setIsEditing((prev) => ({ ...prev, [section]: false }));
    } catch (error: unknown) {
      console.error("Error updating information:", error);
      showNotification("Failed to update information", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (): Promise<void> => {
    if (passwordData.new !== passwordData.confirm) {
      showNotification("New passwords don't match", "error");
      return;
    }

    if (passwordData.new.length < 8) {
      showNotification("Password must be at least 8 characters long", "error");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showNotification("Password updated successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      showNotification("Failed to update password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserData, value: string): void => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof PasswordData, value: string): void => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <TitleTag title="Account" />
      <div className="h-[40px]" />
      <div className=" md:flex-row  shadow-lg rounded-2xl  gap-10  bg-white  p-6 flex flex-col min-h-screen transition-all duration-300 ">
        {/* Sidebar */}
        <aside className="w-full md:w-1/4 min-h-screen border-r border-r-gray-200 pr-4">
          <nav className="flex flex-col gap-2 flex-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`text-left py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "profile"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/10 hover:text-gray-700"
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              My Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`text-left py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === "security"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/10 hover:text-gray-700"
              }`}
            >
              <Shield className="h-4 w-4 inline mr-2" />
              Security
            </button>
          </nav>

          <button
            onClick={logoutUser}
            className="mt-8 text-red-600 flex items-center gap-2 py-3 px-4 rounded-lg hover:bg-red-50 transition-all duration-300 hover:shadow-md"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white   min-h-screen transition-all duration-300  ">
          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-bold mb-8 text-primary">My Profile</h2>
              <div className="space-y-6">
                {/* User Info Card */}
                <div className="bg-white rounded-xl border shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-200 hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={generateAvatar(`${userData.firstName} ${userData.lastName}`)}
                        alt={`${userData.firstName} ${userData.lastName}`}
                      />
                      <AvatarFallback className="bg-blue-600 text-white text-lg">
                        {userData.firstName?.[0]}
                        {userData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-2xl font-semibold">
                        {userData.firstName} {userData.lastName}
                      </div>
                      <div className="text-gray-500">{userData.email}</div>
                    </div>
                  </div>
                </div>

                {/* Personal Information Card */}
                <div className="bg-white rounded-xl border shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-200 hover:-translate-y-1">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="font-semibold text-lg">Personal Information</div>
                    {!isEditing.personal ? (
                      <Button onClick={() => handleEdit("personal")} variant="outline" className="mt-4 md:mt-0">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button onClick={() => handleSave("personal")} disabled={isLoading} size="sm">
                          {isLoading ? "Saving..." : "Save"}
                        </Button>
                        <Button onClick={() => handleCancel("personal")} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isEditing.personal ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">First Name</div>
                        <div className="font-medium">{userData.firstName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Last Name</div>
                        <div className="font-medium">{userData.lastName}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Phone Number</div>
                        <div className="font-medium">{userData.phoneNumber}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium">
                          First Name
                        </Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="firstName"
                            value={editData.firstName}
                            onChange={(e) => handleInputChange("firstName", e.target.value)}
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
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="phoneNumber" className="text-sm font-medium">
                          Phone Number
                        </Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="phoneNumber"
                            value={editData.phoneNumber}
                            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Email Address Card */}
                <div className="bg-white rounded-xl border shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-200 hover:-translate-y-1">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="font-semibold text-lg">Email Address</div>
                    {!isEditing.email ? (
                      <Button onClick={() => handleEdit("email")} variant="outline" className="mt-4 md:mt-0">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button onClick={() => handleSave("email")} disabled={isLoading} size="sm">
                          {isLoading ? "Saving..." : "Save"}
                        </Button>
                        <Button onClick={() => handleCancel("email")} variant="outline" size="sm">
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isEditing.email ? (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Email Address</div>
                      <div className="font-medium">{userData.email}</div>
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
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2 className="text-2xl font-bold mb-8 text-primary">Security Settings</h2>

              <div className="bg-white rounded-xl border shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="mb-6">
                  <div className="font-semibold text-lg mb-2">Change Password</div>
                  <div className="text-sm text-gray-600">Ensure your account is secure with a strong password</div>
                </div>

                <div className="space-y-4 ">
                  <div>
                    <Label htmlFor="currentPassword" className="text-sm font-medium">
                      Current Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.current}
                        onChange={(e) => handlePasswordChange("current", e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                        onChange={(e) => handlePasswordChange("new", e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password
                    </Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirm}
                        onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 transition-all duration-300 hover:shadow-md">
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
                    disabled={isLoading || !passwordData.current || !passwordData.new || !passwordData.confirm}
                    className="w-full transition-all duration-300 hover:shadow-md"
                  >
                    {isLoading ? "Updating Password..." : "Update Password"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
