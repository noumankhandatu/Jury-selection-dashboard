import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createOrganizationApi } from "@/api/api";
import { Building2, Mail, Phone, MapPin, Loader2 } from "lucide-react";

export default function CreateOrganizationPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

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
    } catch (error: any) {
      console.error("Error creating organization:", error);
      toast.error(error.response?.data?.error || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-none shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Create Your Organization
          </CardTitle>
          <CardDescription className="text-base">
            Set up your workspace to start using Jury Duty SaaS
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name - Required */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Organization Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Smith Law Firm"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="h-12 text-base"
                required
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                This will be displayed across your dashboard
              </p>
            </div>

            {/* Email - Optional */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                Organization Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@smithlaw.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="h-12 text-base"
                disabled={loading}
              />
            </div>

            {/* Phone - Optional */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="h-12 text-base"
                disabled={loading}
              />
            </div>

            {/* Address - Optional */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-base font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Address
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Legal Street, City, State 12345"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="h-12 text-base"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
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

            <p className="text-center text-sm text-gray-500 mt-4">
              After creating your organization, you'll choose a subscription plan
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

