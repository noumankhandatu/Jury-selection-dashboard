import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Users, Mail, UserPlus, Trash2, Shield, User, Loader2, Crown } from "lucide-react";
import { getOrganizationMembersApi, inviteTeamMemberApi, removeTeamMemberApi } from "@/api/api";
import TitleTag from "@/components/shared/tag/tag";

interface Member {
  id: string;
  role: string;
  isActive: boolean;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    lastLoginAt?: string;
  };
}

export default function TeamManagementPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");

  const organizationId = localStorage.getItem("organizationId");
  const userRole = localStorage.getItem("userRole");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (organizationId) {
      fetchMembers();
    }
  }, [organizationId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await getOrganizationMembersApi(organizationId!);
      setMembers(response.members || []);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail.trim()) {
      toast.error("Email is required");
      return;
    }

    setInviting(true);

    try {
      await inviteTeamMemberApi(organizationId!, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      toast.success("Invitation sent successfully!");
      setInviteEmail("");
      setInviteRole("MEMBER");
    } catch (error: any) {
      console.error("Error inviting member:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to send invitation";
      toast.error(errorMsg);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async () => {
    if (!memberToRemove) return;

    try {
      await removeTeamMemberApi(organizationId!, memberToRemove.user.id);
      toast.success("Team member removed successfully");
      setMemberToRemove(null);
      fetchMembers();
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error(error.response?.data?.error || "Failed to remove member");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="w-4 h-4" />;
      case "ADMIN":
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      OWNER: "bg-purple-100 text-purple-700 border-purple-200",
      ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
      MEMBER: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <Badge className={`${variants[role]} flex items-center gap-1 border`}>
        {getRoleIcon(role)}
        <span>{role}</span>
      </Badge>
    );
  };

  const canInvite = userRole === "OWNER" || userRole === "ADMIN";
  const canRemove = userRole === "OWNER" || userRole === "ADMIN";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <TitleTag title="Team Management" />

        {/* Current Members */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Team Members ({members.length})
            </CardTitle>
            <CardDescription>
              Manage your organization's team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {member.user.firstName[0]}{member.user.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {member.user.firstName} {member.user.lastName}
                        </h3>
                        {getRoleBadge(member.role)}
                      </div>
                      <p className="text-sm text-gray-600">{member.user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                        {member.user.lastLoginAt && (
                          <> • Last active {new Date(member.user.lastLoginAt).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {canRemove && member.role !== "OWNER" && member.user.id !== currentUserId && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setMemberToRemove(member)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              ))}

              {members.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No team members yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invite Member */}
        {canInvite && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Invite Team Member
              </CardTitle>
              <CardDescription>
                Send an invitation to add a new member to your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={inviting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteRole}
                      onValueChange={(value: "ADMIN" | "MEMBER") => setInviteRole(value)}
                      disabled={inviting}
                    >
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member - Basic access</SelectItem>
                        <SelectItem value="ADMIN">Admin - Can invite others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={inviting}
                  className="w-full md:w-auto"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Invitation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Remove Confirmation Dialog */}
        <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {memberToRemove?.user.firstName} {memberToRemove?.user.lastName} from your organization?
                They will lose access to all cases, jurors, and sessions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemove} className="bg-red-600 hover:bg-red-700">
                Remove Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

