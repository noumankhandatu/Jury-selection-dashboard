import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createOrganizationApi } from "@/api/api";
import { Building2, Mail, Phone, MapPin, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { formatPhoneInput } from "@/utils/format";

export default function CreateOrganizationPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Auto-fill email and phone from logged-in user
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.email) {
          setFormData((prev) => ({ ...prev, email: user.email }));
        }
        if (user.phoneNumber) {
          setFormData((prev) => ({ ...prev, phone: user.phoneNumber }));
        }
      }
    } catch (error) {
      console.error("Error reading user data from localStorage:", error);
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    setLoading(true);

    try {
      const response = await createOrganizationApi({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      });

      const organization = response.organization;

      // Store organization info
      localStorage.setItem("organizationId", organization.id);
      localStorage.setItem("organizationName", organization.name);
      localStorage.setItem("userRole", "OWNER"); // Creator is always owner

      toast.success("Organization created successfully!");

      // Redirect to subscription page with full page reload
      setTimeout(() => {
        window.location.href = "/subscription/select";
      }, 1000);
    } catch (error: unknown) {
      console.error("Error creating organization:", error);
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to create organization";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* Header Section */}
          <CardHeader className="space-y-4 text-center pb-8 pt-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto w-20 h-20 mb-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
            </motion.div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Create Your Organization
          </CardTitle>
            <CardDescription className="text-lg text-gray-600">
            Set up your workspace to start using Jury AI
          </CardDescription>
        </CardHeader>

          <CardContent className="p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name - Required */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
              <Label
                htmlFor="name"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                Organization Name <span className="text-red-500">*</span>
              </Label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-md opacity-20 blur-sm"></div>
                  <div className="relative bg-white rounded-md p-[1px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                    <div className="bg-white rounded-[calc(0.375rem-1px)]">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 z-10" />
              <Input
                id="name"
                type="text"
                placeholder="e.g., Smith Law Firm"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                        className="h-12 pl-12 pr-4 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-gray-400"
                required
                disabled={loading}
              />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                This will be displayed across your dashboard
              </p>
              </motion.div>

            {/* Email - Optional */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
              <Label
                htmlFor="email"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                Organization Email
              </Label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-md opacity-20 blur-sm"></div>
                  <div className="relative bg-white rounded-md p-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                    <div className="bg-white rounded-[calc(0.375rem-1px)]">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500 z-10" />
              <Input
                id="email"
                type="email"
                placeholder="contact@smithlaw.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                        className="h-12 pl-12 pr-4 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-gray-400"
                disabled={loading}
              />
                    </div>
                  </div>
                </div>
              {formData.email && (
                  <p className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                  Pre-filled from your account. You can edit if needed.
                </p>
              )}
              </motion.div>

            {/* Phone - Optional */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
              <Label
                htmlFor="phone"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-white" />
                  </div>
                Phone Number
              </Label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-md opacity-20 blur-sm"></div>
                  <div className="relative bg-white rounded-md p-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
                    <div className="bg-white rounded-[calc(0.375rem-1px)]">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500 z-10" />
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleChange("phone", formatPhoneInput(e.target.value))}
                        className="h-12 pl-12 pr-4 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-gray-400"
                disabled={loading}
                maxLength={14}
              />
                    </div>
                  </div>
                </div>
              {formData.phone && (
                  <p className="text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-md inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                  Pre-filled from your account. You can edit if needed.
                </p>
              )}
              </motion.div>

            {/* Address - Optional */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
              <Label
                htmlFor="address"
                  className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                Address
              </Label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 rounded-md opacity-20 blur-sm"></div>
                  <div className="relative bg-white rounded-md p-[1px] bg-gradient-to-r from-pink-500 via-red-500 to-orange-500">
                    <div className="bg-white rounded-[calc(0.375rem-1px)]">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-500 z-10" />
              <Input
                id="address"
                type="text"
                placeholder="123 Legal Street, City, State 12345"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                        className="h-12 pl-12 pr-4 text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-gray-400"
                disabled={loading}
              />
            </div>
                  </div>
                </div>
              </motion.div>

            {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="pt-4"
              >
            <Button
              type="submit"
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Organization...
                </>
              ) : (
                <>
                  <Building2 className="w-5 h-5 mr-2" />
                  Create Organization & Continue
                </>
              )}
            </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                After creating your organization, you'll choose a subscription plan
              </motion.p>
          </form>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
