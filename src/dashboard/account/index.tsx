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
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Edit,
  LogOut,
  Shield,
  KeyRound,
  Camera,
  X,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "@/utils/config/baseUrl";
import { formatPhoneInput } from "@/utils/format";
import {
  requestPasswordChangeOTPApi,
  verifyPasswordOTPApi,
  changePasswordApi,
  uploadAvatarApi,
  uploadCoverPhotoApi,
  deleteAvatarApi,
  deleteCoverPhotoApi,
  getProfileImagesApi,
} from "@/api/api";
import { toast } from "sonner";
interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar?: string | null;
  coverPhoto?: string | null;
}

interface PasswordData {
  new: string;
  confirm: string;
}

type PasswordChangeStep = "initial" | "otp-sent" | "otp-verified";

interface EditingState {
  personal: boolean;
  email: boolean;
}

export default function AccountPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<EditingState>({
    personal: false,
    email: false,
  });
  const [passwordChangeStep, setPasswordChangeStep] =
    useState<PasswordChangeStep>("initial");
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [userData, setUserData] = useState<UserData>({
    id: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    avatar: null,
    coverPhoto: null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as UserData;
      setUserData(parsedUser);
    }

    // Fetch profile images
    fetchProfileImages();
  }, []);

  const fetchProfileImages = async () => {
    try {
      const data = await getProfileImagesApi();
      setUserData((prev) => ({
        ...prev,
        avatar: data.avatar,
        coverPhoto: data.coverPhoto,
      }));
    } catch (error) {
      console.error("Error fetching profile images:", error);
    }
  };

  const [editData, setEditData] = useState<UserData>({ ...userData });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    new: "",
    confirm: "",
  });

  const generateAvatar = (name: string): string => {
    const seed = name.toLowerCase().replace(/\s+/g, "");
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  // Image upload handlers
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploadingAvatar(true);
    try {
      const data = await uploadAvatarApi(file);
      setUserData((prev) => ({
        ...prev,
        avatar: data.avatar,
      }));

      // Update localStorage
      if (data.userForStorage) {
        localStorage.setItem("user", JSON.stringify(data.userForStorage));
      }

      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(
        error.response?.data?.error || "Failed to upload profile picture"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverPhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploadingCover(true);
    try {
      const data = await uploadCoverPhotoApi(file);
      setUserData((prev) => ({
        ...prev,
        coverPhoto: data.coverPhoto,
      }));
      toast.success("Cover photo updated successfully!");
    } catch (error: any) {
      console.error("Error uploading cover photo:", error);
      toast.error(
        error.response?.data?.error || "Failed to upload cover photo"
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatarApi();
      setUserData((prev) => ({
        ...prev,
        avatar: null,
      }));
      toast.success("Profile picture removed successfully!");
    } catch (error: any) {
      console.error("Error deleting avatar:", error);
      toast.error(
        error.response?.data?.error || "Failed to remove profile picture"
      );
    }
  };

  const handleDeleteCoverPhoto = async () => {
    try {
      await deleteCoverPhotoApi();
      setUserData((prev) => ({
        ...prev,
        coverPhoto: null,
      }));
      toast.success("Cover photo removed successfully!");
    } catch (error: any) {
      console.error("Error deleting cover photo:", error);
      toast.error(
        error.response?.data?.error || "Failed to remove cover photo"
      );
    }
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

  const handleRequestOTP = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await requestPasswordChangeOTPApi();
      toast.success("OTP sent to your email!");
      setPasswordChangeStep("otp-sent");
    } catch (error: any) {
      console.error("Error requesting OTP:", error);
      toast.error(error.response?.data?.error || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (): Promise<void> => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      await verifyPasswordOTPApi(otp);
      toast.success("OTP verified successfully!");
      setPasswordChangeStep("otp-verified");
      setOtpVerified(true);
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error(error.response?.data?.error || "Invalid or expired OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (): Promise<void> => {
    if (!otpVerified) {
      toast.error("Please verify OTP first");
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordData.new.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await changePasswordApi({
        otp,
        newPassword: passwordData.new,
      });

      toast.success(
        "Password changed successfully! Please login with your new password."
      );

      // Clear form
      setPasswordData({ new: "", confirm: "" });
      setOtp("");
      setOtpVerified(false);
      setPasswordChangeStep("initial");

      // Auto-logout after password change
      if (response.requiresLogout) {
        setTimeout(() => {
          navigate("/");

          localStorage.clear();
          window.location.reload();
          toast.success("Logged out successfully");
        }, 2000); // Wait 2 seconds to show the success message
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordFlow = (): void => {
    setPasswordChangeStep("initial");
    setOtp("");
    setOtpVerified(false);
    setPasswordData({ new: "", confirm: "" });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 lg:px-8">
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your profile information and security settings
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-6 border-none shadow-xl overflow-visible bg-white/90 backdrop-blur-sm">
          {/* Cover Photo */}
          <div className="relative h-56 w-full group">
            {userData.coverPhoto ? (
              <img
                src={userData.coverPhoto}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full w-full" />
            )}

            {/* Cover Photo Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

            {/* Cover Photo Actions */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverPhotoUpload}
                className="hidden"
                id="cover-upload"
                disabled={uploadingCover}
              />
              <label htmlFor="cover-upload">
                <Button
                  size="sm"
                  className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg cursor-pointer"
                  disabled={uploadingCover}
                  asChild
                >
                  <span>
                    {uploadingCover ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-t-transparent border-gray-900 rounded-full animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Change Cover
                      </span>
                    )}
                  </span>
                </Button>
              </label>

              {userData.coverPhoto && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="shadow-lg"
                  onClick={handleDeleteCoverPhoto}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <CardContent className="pt-0 pb-6 overflow-visible">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-20 pt-24">
              {/* Avatar with Gradient Border */}
              <div className="relative group flex-shrink-0">
                <div className="relative p-1 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 shadow-2xl">
                  <Avatar className="h-36 w-36 rounded-full border-4 border-white shadow-xl">
                    <AvatarImage
                      src={
                        userData.avatar ||
                        generateAvatar(
                          `${userData.firstName} ${userData.lastName}`
                        )
                      }
                      className="object-cover"
                      alt={`${userData.firstName} ${userData.lastName}`}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl font-bold">
                      {userData.firstName?.[0]}
                      {userData.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Avatar Upload Button */}
                <div className="absolute bottom-2 right-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                    disabled={uploadingAvatar}
                  />
                  <label htmlFor="avatar-upload">
                    <Button
                      size="sm"
                      className="rounded-full w-12 h-12 p-0 shadow-xl cursor-pointer bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-2 border-white"
                      disabled={uploadingAvatar}
                      asChild
                    >
                      <span>
                        {uploadingAvatar ? (
                          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5 text-white" />
                        )}
                      </span>
                    </Button>
                  </label>
                </div>

                {/* Delete Avatar Button */}
                {userData.avatar && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-2 border-white"
                    onClick={handleDeleteAvatar}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="flex-1 pb-4 min-w-0 overflow-visible">
                <div className="text-3xl font-bold text-gray-900 mb-2 break-words overflow-visible">
                  {userData.firstName} {userData.lastName}
                </div>
                <div className="text-gray-600 flex items-center gap-2 text-lg break-words overflow-visible">
                  <Mail className="h-5 w-5 flex-shrink-0" />
                  <span className="break-all">{userData.email}</span>
                </div>
              </div>

              <div className="pb-4 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={logoutUser}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
            >
              <User className="h-4 w-4 mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
            >
              <Shield className="h-4 w-4 mr-2" /> Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-none shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    Personal Information
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Update your name and phone number.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {!isEditing.personal ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                        <div className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">
                          First Name
                        </div>
                        <div className="font-bold text-gray-900 text-lg">
                          {userData.firstName}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                        <div className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">
                          Last Name
                        </div>
                        <div className="font-bold text-gray-900 text-lg">
                          {userData.lastName}
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                        <div className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">
                          Phone Number
                        </div>
                        <div className="font-bold text-gray-900 text-lg">
                          {userData.phoneNumber}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          First Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="firstName"
                            value={editData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            className="pl-11 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="lastName"
                          className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          Last Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="lastName"
                            value={editData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            className="pl-11 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label
                          htmlFor="phoneNumber"
                          className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="phoneNumber"
                            type="tel"
                            value={editData.phoneNumber}
                            onChange={(e) =>
                              handleInputChange("phoneNumber", formatPhoneInput(e.target.value))
                            }
                            placeholder="(555) 123-4567"
                            maxLength={14}
                            className="pl-11 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                  {!isEditing.personal ? (
                    <Button
                      variant="outline"
                      onClick={() => handleEdit("personal")}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleSave("personal")}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
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

              <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    Contact
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Your account email address cannot be changed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-100">
                    <div className="text-xs text-gray-600 mb-2 font-semibold uppercase tracking-wide">
                      Email Address
                    </div>
                    <div className="font-bold text-gray-900 text-lg break-all flex items-center gap-2">
                      <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <span>{userData.email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 mt-6">
            <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  Change Password
                </CardTitle>
                <CardDescription className="mt-1">
                  Secure password change with OTP verification
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Step 1: Request OTP */}
                {passwordChangeStep === "initial" && (
                  <>
                    <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-blue-900 mb-3 text-lg">
                            Password Change Process
                          </p>
                          <ol className="text-sm text-blue-800 space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-blue-600">
                                1.
                              </span>
                              <span>
                                Click "Send OTP" to receive a verification code
                                via email
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-blue-600">
                                2.
                              </span>
                              <span>
                                Enter the 6-digit OTP code you receive
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-bold text-blue-600">
                                3.
                              </span>
                              <span>Set your new password</span>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleRequestOTP}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 text-base font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Mail className="h-5 w-5 mr-2" />
                          Send OTP to Email
                        </>
                      )}
                    </Button>
                  </>
                )}

                {/* Step 2: Verify OTP */}
                {passwordChangeStep === "otp-sent" && !otpVerified && (
                  <>
                    <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-green-900 mb-2 text-lg">
                            OTP Sent!
                          </p>
                          <p className="text-sm text-green-800">
                            Check your email{" "}
                            <span className="font-semibold">
                              ({userData.email})
                            </span>{" "}
                            for the 6-digit verification code. The code will
                            expire in 10 minutes.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="otp"
                        className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                      >
                        <KeyRound className="w-4 h-4" />
                        Enter 6-Digit OTP
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="otp"
                          type="text"
                          placeholder="000000"
                          maxLength={6}
                          value={otp}
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, ""))
                          }
                          className="pl-12 pr-4 text-center text-3xl tracking-[0.5em] font-bold h-16 border-2 border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleVerifyOTP}
                        disabled={isLoading || otp.length !== 6}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 font-semibold"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                            Verifying...
                          </>
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleResetPasswordFlow}
                        disabled={isLoading}
                        className="h-12"
                      >
                        Cancel
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={handleRequestOTP}
                      disabled={isLoading}
                      className="w-full text-sm text-gray-600 hover:text-gray-900"
                    >
                      Didn't receive OTP?{" "}
                      <span className="font-semibold text-blue-600">
                        Resend
                      </span>
                    </Button>
                  </>
                )}

                {/* Step 3: Change Password */}
                {passwordChangeStep === "otp-verified" && otpVerified && (
                  <>
                    <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-green-900 text-lg">
                            ✓ OTP Verified Successfully!
                          </p>
                          <p className="text-sm text-green-800 mt-1">
                            You can now set your new password.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.new}
                          onChange={(e) =>
                            handlePasswordChange("new", e.target.value)
                          }
                          className="pl-11 pr-11 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirm}
                          onChange={(e) =>
                            handlePasswordChange("confirm", e.target.value)
                          }
                          className="pl-11 pr-11 h-11 border-gray-300 focus:border-green-500 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-blue-900 mb-3 text-lg">
                            Password Requirements
                          </p>
                          <ul className="text-sm text-blue-800 space-y-2">
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                              At least 8 characters long
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                              Include uppercase and lowercase letters
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                              Include at least one number
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                              Include at least one special character
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handlePasswordUpdate}
                        disabled={
                          isLoading ||
                          !passwordData.new ||
                          !passwordData.confirm
                        }
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-12 font-semibold"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2" />
                            Changing Password...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleResetPasswordFlow}
                        disabled={isLoading}
                        className="h-12"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
