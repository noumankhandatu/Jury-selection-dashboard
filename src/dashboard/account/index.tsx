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
import TitleTag from "@/components/shared/tag/tag";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 lg:px-8">
      <TitleTag title="Account" />
      <div className="h-6" />

      {/* Header */}
      <Card className="mb-6 border-0 shadow-lg overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 w-full group">
          {userData.coverPhoto ? (
            <img
              src={userData.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-full w-full" />
          )}

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
                variant="secondary"
                className="cursor-pointer"
                disabled={uploadingCover}
                asChild
              >
                <span>
                  {uploadingCover ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
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
                onClick={handleDeleteCoverPhoto}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
            {/* Avatar with Upload */}
            <div className="relative group">
              <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl ">
              <AvatarImage
                  src={
                    userData.avatar ||
                    generateAvatar(`${userData.firstName} ${userData.lastName}`)
                  }
                  className="object-cover"
                alt={`${userData.firstName} ${userData.lastName}`}
              />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                {userData.firstName?.[0]}
                {userData.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

              {/* Avatar Upload Button */}
              <div className="absolute bottom-0 right-0">
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
                    className="rounded-full w-10 h-10 p-0 shadow-lg cursor-pointer"
                    disabled={uploadingAvatar}
                    asChild
                  >
                    <span>
                      {uploadingAvatar ? (
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
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
                  className="absolute top-0 right-0 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleDeleteAvatar}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
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

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Secure password change with OTP verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Request OTP */}
              {passwordChangeStep === "initial" && (
                <>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">
                          Password Change Process
                        </p>
                        <ol className="text-xs space-y-1 list-decimal list-inside">
                          <li>
                            Click "Send OTP" to receive a verification code via
                            email
                          </li>
                          <li>Enter the 6-digit OTP code you receive</li>
                          <li>Set your new password</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleRequestOTP}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      "Sending OTP..."
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send OTP to Email
                      </>
                    )}
                  </Button>
                </>
              )}

              {/* Step 2: Verify OTP */}
              {passwordChangeStep === "otp-sent" && !otpVerified && (
                <>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">OTP Sent!</p>
                        <p className="text-xs">
                          Check your email ({userData.email}) for the 6-digit
                          verification code. The code will expire in 10 minutes.
                        </p>
                      </div>
                    </div>
                  </div>

              <div>
                    <Label htmlFor="otp" className="text-sm font-medium">
                      Enter 6-Digit OTP
                </Label>
                <div className="relative mt-1">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={otp}
                    onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                    }
                        className="pl-10 text-center text-2xl tracking-widest"
                  />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={isLoading || otp.length !== 6}
                      className="flex-1"
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleResetPasswordFlow}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={handleRequestOTP}
                    disabled={isLoading}
                    className="w-full text-sm"
                  >
                    Didn't receive OTP? Resend
                  </Button>
                </>
              )}

              {/* Step 3: Change Password */}
              {passwordChangeStep === "otp-verified" && otpVerified && (
                <>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-start">
                      <Shield className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium">
                          ✓ OTP Verified Successfully!
                        </p>
                        <p className="text-xs mt-1">
                          You can now set your new password.
                        </p>
                      </div>
                </div>
              </div>

              <div>
                    <Label
                      htmlFor="newPassword"
                      className="text-sm font-medium"
                    >
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
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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
                        <p className="font-medium mb-2">
                          Password Requirements
                        </p>
                    <ul className="text-xs space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Include at least one number</li>
                      <li>• Include at least one special character</li>
                    </ul>
                  </div>
                </div>
              </div>

                  <div className="flex gap-2">
              <Button
                onClick={handlePasswordUpdate}
                disabled={
                        isLoading || !passwordData.new || !passwordData.confirm
                }
                      className="flex-1"
              >
                      {isLoading ? "Changing Password..." : "Change Password"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleResetPasswordFlow}
                      disabled={isLoading}
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
  );
}
