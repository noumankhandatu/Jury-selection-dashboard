/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, JSX } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Users,
  Mail,
  UserPlus,
  Trash2,
  Shield,
  User,
  Loader2,
  Crown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  getOrganizationMembersApi,
  inviteTeamMemberApi,
  removeTeamMemberApi,
  getAllInvitationsApi,
} from "@/api/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  inviter: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function TeamManagementPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitationCounts, setInvitationCounts] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0,
    revoked: 0,
  });
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [activeTab, setActiveTab] = useState("members");

  const organizationId = localStorage.getItem("organizationId");
  const userRole = localStorage.getItem("userRole");
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (organizationId) {
      fetchMembers();
      fetchInvitations();
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

  const fetchInvitations = async () => {
    try {
      const response = await getAllInvitationsApi(organizationId!);
      setInvitations(response.invitations || []);
      setInvitationCounts(
        response.counts || {
          total: 0,
          pending: 0,
          accepted: 0,
          expired: 0,
          revoked: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast.error("Failed to load invitations");
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
      fetchInvitations(); // Refresh invitations list
    } catch (error: any) {
      console.error("Error inviting member:", error);
      const errorMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to send invitation";
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

    const roleDisplayNames: Record<string, string> = {
      OWNER: "Owner",
      ADMIN: "Supervisor",
      MEMBER: "Member",
    };

    return (
      <Badge className={`${variants[role]} flex items-center gap-1 border`}>
        {getRoleIcon(role)}
        <span>{roleDisplayNames[role] || role}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { className: string; icon: JSX.Element; text: string }
    > = {
      PENDING: {
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <Clock className="w-3 h-3" />,
        text: "Pending",
      },
      ACCEPTED: {
        className: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle2 className="w-3 h-3" />,
        text: "Accepted",
      },
      EXPIRED: {
        className: "bg-gray-100 text-gray-700 border-gray-200",
        icon: <AlertCircle className="w-3 h-3" />,
        text: "Expired",
      },
      REVOKED: {
        className: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle className="w-3 h-3" />,
        text: "Revoked",
      },
    };

    const badge = variants[status];

    return (
      <Badge className={`${badge.className} flex items-center gap-1 border`}>
        {badge.icon}
        <span>{badge.text}</span>
      </Badge>
    );
  };

  const canInvite = userRole === "OWNER" || userRole === "ADMIN";
  const canRemove = userRole === "OWNER" || userRole === "ADMIN";

  // Count team members excluding OWNER role
  const teamMembersCount = members.filter((m) => m.role !== "OWNER").length;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 lg:px-8">
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Team Management
            </h1>
            <p className="text-gray-600 text-lg">
              Manage your organization's team members and their roles
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-6 py-3 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Team Size</div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {teamMembersCount} members
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Members and Invitations */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
            <TabsTrigger value="members" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Members ({teamMembersCount})
            </TabsTrigger>
            <TabsTrigger value="invitations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Invitations ({invitationCounts.total})
            </TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6 mt-6">
            {/* Current Members */}
            <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      Team Members ({teamMembersCount})
                      {members.length > teamMembersCount && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          <Crown className="w-3 h-3 mr-1" />
                          + {members.length - teamMembersCount} owner
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      Manage your organization's team members and their roles
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div
                      key={member.id}
                      className="group flex items-center justify-between p-5 bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300 hover:-translate-y-0.5"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="relative">
                          {/* Gradient Border Avatar */}
                          <div className={`relative p-0.5 rounded-full ${
                            member.role === "OWNER"
                              ? "bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600"
                              : member.role === "ADMIN"
                              ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600"
                              : "bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600"
                          } shadow-lg`}>
                            <Avatar className="w-14 h-14 rounded-full border-2 border-white">
                              <AvatarImage
                                src={member.user.avatar}
                                alt={`${member.user.firstName} ${member.user.lastName}`}
                                className="object-cover"
                              />
                              <AvatarFallback className={`bg-gradient-to-br ${
                                member.role === "OWNER"
                                  ? "from-purple-500 to-pink-500"
                                  : member.role === "ADMIN"
                                  ? "from-blue-500 to-indigo-500"
                                  : "from-gray-400 to-gray-600"
                              } text-white font-bold text-lg`}>
                          {member.user.firstName[0]}
                          {member.user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          {member.role === "OWNER" && (
                            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full p-1.5 shadow-lg border-2 border-white">
                              <Crown className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {member.user.firstName} {member.user.lastName}
                            </h3>
                            {getRoleBadge(member.role)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{member.user.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Joined {new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                            {member.user.lastLoginAt && (
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span>Active {new Date(member.user.lastLoginAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {canRemove &&
                        member.role !== "OWNER" &&
                        member.user.id !== currentUserId && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setMemberToRemove(member)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        )}
                    </div>
                  ))}

                  {members.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-12 h-12 text-blue-400 opacity-50" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No team members yet</h3>
                      <p className="text-gray-500 mb-6">Start building your team by inviting members</p>
                      {canInvite && (
                        <Button
                          onClick={() => setActiveTab("invitations")}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite Your First Member
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Invite Member */}
            {canInvite && (
              <Card className="border-none shadow-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-sm border-2 border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    Invite Team Member
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Send an invitation to add a new member to your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleInvite} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 font-semibold flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          disabled={inviting}
                          required
                          className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-gray-700 font-semibold flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Role
                        </Label>
                        <Select
                          value={inviteRole}
                          onValueChange={(value: "ADMIN" | "MEMBER") =>
                            setInviteRole(value)
                          }
                          disabled={inviting}
                        >
                          <SelectTrigger id="role" className="h-11 border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">Member</div>
                                  <div className="text-xs text-gray-500">Basic access</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="ADMIN">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">Supervisor</div>
                                  <div className="text-xs text-gray-500">Can invite others</div>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={inviting}
                      className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11 px-8"
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
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="space-y-6 mt-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-yellow-700 mb-1">
                      {invitationCounts.pending}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Pending</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-green-700 mb-1">
                      {invitationCounts.accepted}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Accepted</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-gray-700 mb-1">
                      {invitationCounts.expired}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Expired</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <XCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-red-700 mb-1">
                      {invitationCounts.revoked}
                    </div>
                    <div className="text-sm font-medium text-gray-700">Revoked</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* All Invitations */}
            <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                  All Invitations ({invitations.length})
                    <CardDescription className="mt-1">
                      Track all team invitations and their current status
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {invitations.map((invitation, index) => (
                    <div
                      key={invitation.id}
                      className="group flex items-center justify-between p-5 bg-gradient-to-r from-white to-gray-50/50 border border-gray-200 rounded-xl hover:shadow-lg hover:border-indigo-300 transition-all duration-300 hover:-translate-y-0.5"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`relative p-0.5 rounded-full bg-gradient-to-br ${
                          invitation.status === "ACCEPTED"
                            ? "from-green-400 via-emerald-500 to-green-600"
                            : invitation.status === "PENDING"
                            ? "from-yellow-400 via-orange-500 to-yellow-600"
                            : invitation.status === "EXPIRED"
                            ? "from-gray-400 via-gray-500 to-gray-600"
                            : "from-red-400 via-pink-500 to-red-600"
                        } shadow-lg`}>
                          <Avatar className="w-14 h-14 rounded-full border-2 border-white">
                            <AvatarFallback className={`bg-gradient-to-br ${
                              invitation.status === "ACCEPTED"
                                ? "from-green-400 to-emerald-500"
                                : invitation.status === "PENDING"
                                ? "from-yellow-400 to-orange-500"
                                : invitation.status === "EXPIRED"
                                ? "from-gray-400 to-gray-500"
                                : "from-red-400 to-pink-500"
                            } text-white font-bold text-lg`}>
                          {invitation.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-lg">
                              {invitation.email}
                            </h3>
                            {getRoleBadge(invitation.role)}
                            {getStatusBadge(invitation.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <User className="w-4 h-4" />
                            <span>Invited by <span className="font-semibold">{invitation.inviter.firstName} {invitation.inviter.lastName}</span></span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-500 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Sent {new Date(invitation.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                            {invitation.status === "ACCEPTED" && invitation.acceptedAt && (
                              <div className="flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Joined {new Date(invitation.acceptedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              </div>
                              )}
                            {invitation.status === "PENDING" && (
                              <div className="flex items-center gap-1 text-yellow-600 font-medium">
                                <AlertCircle className="w-3 h-3" />
                                <span>Expires {new Date(invitation.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {invitations.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-12 h-12 text-indigo-400 opacity-50" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No invitations yet</h3>
                      <p className="text-gray-500 mb-6">Start inviting team members to collaborate</p>
                      {canInvite && (
                        <Button
                          onClick={() => setActiveTab("members")}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Send Your First Invitation
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Remove Confirmation Dialog */}
        <AlertDialog
          open={!!memberToRemove}
          onOpenChange={() => setMemberToRemove(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {memberToRemove?.user.firstName}{" "}
                {memberToRemove?.user.lastName} from your organization? They
                will lose access to all cases, jurors, and sessions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
