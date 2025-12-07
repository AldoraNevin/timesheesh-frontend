"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { adminService } from "@/lib/api";
import type { User } from "@/lib/api/types";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, EllipsisVertical, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

type TabType = "full" | "limited" | "groups" | "reminders";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  joined: boolean;
  billableRate: string;
  role: string;
  group: string;
  isYou: boolean;
}

export default function TeamPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emails, setEmails] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("full");
  const [error, setError] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [exactlyValue, setExactlyValue] = useState("");
  const [smallerValue, setSmallerValue] = useState("");
  const [largerValue, setLargerValue] = useState("");
  const [exactlyChecked, setExactlyChecked] = useState(false);
  const [smallerChecked, setSmallerChecked] = useState(false);
  const [largerChecked, setLargerChecked] = useState(false);
  const [searchRole, setSearchRole] = useState("");
  const [selectAllRoles, setSelectAllRoles] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        const users = await adminService.getAllUsers();
        
        // Get current user from profile to determine "isYou"
        let currentUserId: number | null = null;
        try {
          const { profileService } = await import("@/lib/api");
          const profile = await profileService.getProfile();
          currentUserId = profile.id;
        } catch (err) {
          // If profile fetch fails, continue without marking "isYou"
          console.warn("Failed to fetch profile:", err);
        }

        // Map User[] to TeamMember[]
        const mappedMembers: TeamMember[] = users.map((user: User) => ({
          id: user.id.toString(),
          name: user.full_name || user.email.split("@")[0],
          email: user.email,
          joined: true, // Default to true, adjust based on your business logic
          billableRate: "Change",
          role: user.role || "Role",
          group: "Group", // This might need to come from a different API
          isYou: currentUserId !== null && user.id === currentUserId,
        }));

        setMembers(mappedMembers);
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        setApiError(err.message || "Gagal memuat data pengguna");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Liste des rôles disponibles
  const availableRoles = ["Admin", "Owner", "Project Manager", "Team Manager"];
  // États pour le dropdown Group
  const [searchGroup, setSearchGroup] = useState("");
  const [selectAllGroups, setSelectAllGroups] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  // États pour la gestion des checkboxes
  const [selectAll, setSelectAll] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Fonction pour gérer la sélection de tous les membres
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedMembers(filteredMembers.map((member) => member.id));
    } else {
      setSelectedMembers([]);
    }
  };

  // Fonction pour gérer la sélection individuelle
  const handleMemberSelection = (memberId: string, checked: boolean) => {
    if (checked) {
      const newSelection = [...selectedMembers, memberId];
      setSelectedMembers(newSelection);
      setSelectAll(newSelection.length === filteredMembers.length);
    } else {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
      setSelectAll(false);
    }
  };

  // Actions du dropdown menu
  const handleEditProfile = (member: any) => {
    console.log("Edit profile for:", member.name);
    // Logique pour éditer le profil
  };

  const handleEditPIN = (member: any) => {
    console.log("Edit PIN for:", member.name);
    // Logique pour éditer le PIN
  };

  // Liste des groupes disponibles
  const availableGroups = [
    "Development",
    "Design",
    "Marketing",
    "Sales",
    "Support",
  ];

  // Fonction pour gérer la sélection de tous les groupes
  const handleSelectAllGroups = (checked: boolean) => {
    setSelectAllGroups(checked);
    if (checked) {
      setSelectedGroups([...availableGroups]);
    } else {
      setSelectedGroups([]);
    }
  };

  // Fonction pour gérer la sélection individuelle des groupes
  const handleGroupSelection = (group: string, checked: boolean) => {
    if (checked) {
      setSelectedGroups([...selectedGroups, group]);
    } else {
      setSelectedGroups(selectedGroups.filter((g) => g !== group));
      setSelectAllGroups(false);
    }
  };

  // Filtrer les groupes selon la recherche
  const filteredGroups = availableGroups.filter((group) =>
    group.toLowerCase().includes(searchGroup.toLowerCase())
  );

  // Fonction pour gérer la sélection de tous les rôles
  const handleSelectAllRoles = (checked: boolean) => {
    setSelectAllRoles(checked);
    if (checked) {
      setSelectedRoles([...availableRoles]);
    } else {
      setSelectedRoles([]);
    }
  };

  // Fonction pour gérer la sélection individuelle des rôles
  const handleRoleSelection = (role: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, role]);
    } else {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
      setSelectAllRoles(false);
    }
  };

  // Filtrer les rôles selon la recherche
  const filteredRoles = availableRoles.filter((role) =>
    role.toLowerCase().includes(searchRole.toLowerCase())
  );

  // Fonction pour appliquer les filtres
  const applyFilters = () => {
    const filters = {
      exactly: exactlyChecked ? parseFloat(exactlyValue) : null,
      smaller: smallerChecked ? parseFloat(smallerValue) : null,
      larger: largerChecked ? parseFloat(largerValue) : null,
    };

    console.log("Filtres appliqués:", filters);
    // Ici tu peux appliquer la logique de filtrage à tes membres
  };

  const handleAddMember = () => {
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email.trim());
    };

    if (emails.trim()) {
      const emailList = emails
        .split(/[\s,;\n]+/)
        .filter((email) => email.trim())
        .map((email) => email.trim());

      // Vérification de la validité des emails
      const validEmails = emailList.filter((email) => isValidEmail(email));
      const hasInvalidEmails = emailList.length > validEmails.length;

      if (hasInvalidEmails || validEmails.length === 0) {
        setError(true);
        return; // Arrêter si des emails sont invalides
      }

      // Réinitialiser l'erreur si tout est bon
      setError(false);

      if (validEmails.length > 0) {
        const newMembers: TeamMember[] = validEmails
          .slice(0, 5)
          .map((email, index) => ({
            id: `new-${Date.now()}-${index}`,
            name: email.split("@")[0],
            email: email,
            joined: false,
            billableRate: "Change",
            role: "Role",
            group: "Group",
            isYou: false,
          }));

        setMembers([...members, ...newMembers]);
        setEmails("");
        setIsDialogOpen(false);
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmails(e.target.value);
    if (error) setError(false); // Réinitialiser l'erreur quand on commence à taper
  };

  // Fonction de filtrage améliorée pour la barre de recherche
  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    // Vous pouvez ajouter d'autres filtres ici selon vos besoins
    return matchesSearch;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case "full":
        return (
          <>
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white whitespace-nowrap px-4 py-2 text-sm font-medium">
                    ADD FULL MEMBER
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto bg-white p-0">
                  <div className="p-6 pb-4">
                    <DialogHeader className="pb-4">
                      <DialogTitle className="text-lg font-medium text-gray-900">
                        Add full members
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="emails"
                          className="text-sm font-medium text-gray-900"
                        >
                          Invite by email
                        </Label>
                        <p className="text-sm text-gray-600">
                          Separate multiple emails with commas, spaces,
                          semicolons, or using an Enter key.
                        </p>
                        <Input
                          id="emails"
                          value={emails}
                          onChange={handleEmailChange}
                          placeholder="Enter up to 5 email addresses"
                          className={`w-full border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                            error
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {error && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <span className="text-red-500">⚠️</span>
                            Please enter valid email addresses (example:
                            user@domain.com)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setError(false); // Réinitialiser l'erreur à la fermeture
                      }}
                      className="px-4 py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      className={`px-4 py-2 text-sm font-medium transition-colors ${
                        error
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                      onClick={handleAddMember}
                      disabled={!emails.trim()}
                    >
                      {error ? "FIX EMAILS" : "SEND INVITE"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="mb-6 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-sm font-medium whitespace-nowrap">
                        FILTER
                      </span>
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-full sm:w-[120px]">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="invited">Invited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full sm:w-[140px] justify-between text-gray-600 border-gray-300 hover:bg-gray-50"
                          >
                            Billable rate
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          className="w-80 p-4 bg-white border border-gray-200 shadow-lg rounded-md"
                          align="start"
                          sideOffset={4}
                        >
                          <div className="space-y-4">
                            {/* Exactly */}
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id="exactly-filter"
                                checked={exactlyChecked}
                                onCheckedChange={(checked) => {
                                  setExactlyChecked(!!checked);
                                  if (!checked) setExactlyValue("");
                                }}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              />
                              <label
                                htmlFor="exactly-filter"
                                className="text-sm text-gray-700 min-w-[80px] cursor-pointer"
                              >
                                Exactly
                              </label>
                              <Input
                                type="number"
                                value={exactlyValue}
                                onChange={(e) =>
                                  setExactlyValue(e.target.value)
                                }
                                placeholder="0"
                                className="h-8 w-20 text-center border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                disabled={!exactlyChecked}
                              />
                            </div>

                            {/* Smaller than */}
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id="smaller-filter"
                                checked={smallerChecked}
                                onCheckedChange={(checked) => {
                                  setSmallerChecked(!!checked);
                                  if (!checked) setSmallerValue("");
                                }}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              />
                              <label
                                htmlFor="smaller-filter"
                                className="text-sm text-gray-700 min-w-[80px] cursor-pointer"
                              >
                                Smaller than
                              </label>
                              <Input
                                type="number"
                                value={smallerValue}
                                onChange={(e) =>
                                  setSmallerValue(e.target.value)
                                }
                                placeholder="0"
                                className="h-8 w-20 text-center border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                disabled={!smallerChecked}
                              />
                            </div>

                            {/* Larger than */}
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id="larger-filter"
                                checked={largerChecked}
                                onCheckedChange={(checked) => {
                                  setLargerChecked(!!checked);
                                  if (!checked) setLargerValue("");
                                }}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              />
                              <label
                                htmlFor="larger-filter"
                                className="text-sm text-gray-700 min-w-[80px] cursor-pointer"
                              >
                                Larger than
                              </label>
                              <Input
                                type="number"
                                value={largerValue}
                                onChange={(e) => setLargerValue(e.target.value)}
                                placeholder="0"
                                className="h-8 w-20 text-center border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                disabled={!largerChecked}
                              />
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full sm:w-[100px] justify-between text-gray-600 border-gray-300 hover:bg-gray-50"
                          >
                            Role
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          className="w-72 p-0 bg-white border border-gray-200 shadow-lg rounded-md"
                          align="start"
                          sideOffset={4}
                        >
                          <div className="p-4 space-y-4">
                            {/* Search Input */}
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                type="text"
                                placeholder="Search Role"
                                value={searchRole}
                                onChange={(e) => setSearchRole(e.target.value)}
                                className="pl-10 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>

                            {/* Select All */}
                            <div className="flex items-center space-x-3 pb-2 border-b border-gray-100">
                              <Checkbox
                                id="select-all-roles"
                                checked={selectAllRoles}
                                onCheckedChange={handleSelectAllRoles}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              />
                              <label
                                htmlFor="select-all-roles"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                Select all
                              </label>
                            </div>

                            {/* Role Section Header */}
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              ROLE
                            </div>

                            {/* Role Options */}
                            <div className="space-y-3 max-h-40 overflow-y-auto">
                              {filteredRoles.map((role) => (
                                <div
                                  key={role}
                                  className="flex items-center space-x-3"
                                >
                                  <Checkbox
                                    id={`role-${role
                                      .toLowerCase()
                                      .replace(" ", "-")}`}
                                    checked={selectedRoles.includes(role)}
                                    onCheckedChange={(checked) =>
                                      handleRoleSelection(role, !!checked)
                                    }
                                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                  />
                                  <label
                                    htmlFor={`role-${role
                                      .toLowerCase()
                                      .replace(" ", "-")}`}
                                    className="text-sm text-gray-700 cursor-pointer flex-1"
                                  >
                                    {role}
                                  </label>
                                  <span className="text-xs text-gray-400 min-w-[12px]">
                                    {selectedRoles.includes(role) ? "1" : ""}
                                  </span>
                                </div>
                              ))}

                              {filteredRoles.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-2">
                                  No roles found
                                </p>
                              )}
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full sm:w-[100px] justify-between text-gray-600 border-gray-300 hover:bg-gray-50"
                          >
                            Group
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          className="w-72 p-0 bg-white border border-gray-200 shadow-lg rounded-md"
                          align="start"
                          sideOffset={4}
                        >
                          <div className="p-4 space-y-4">
                            {/* Search Input */}
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                type="text"
                                placeholder="Search Group"
                                value={searchGroup}
                                onChange={(e) => setSearchGroup(e.target.value)}
                                className="pl-10 h-9 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>

                            {/* Select All */}
                            <div className="flex items-center space-x-3 pb-2 border-b border-gray-100">
                              <Checkbox
                                id="select-all-groups"
                                checked={selectAllGroups}
                                onCheckedChange={handleSelectAllGroups}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              />
                              <label
                                htmlFor="select-all-groups"
                                className="text-sm text-gray-700 cursor-pointer"
                              >
                                Select all
                              </label>
                            </div>

                            {/* Groups Section */}
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {filteredGroups.map((group) => (
                                <div
                                  key={group}
                                  className="flex items-center space-x-3"
                                >
                                  <Checkbox
                                    id={`group-${group
                                      .toLowerCase()
                                      .replace(" ", "-")}`}
                                    checked={selectedGroups.includes(group)}
                                    onCheckedChange={(checked) =>
                                      handleGroupSelection(group, !!checked)
                                    }
                                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                  />
                                  <label
                                    htmlFor={`group-${group
                                      .toLowerCase()
                                      .replace(" ", "-")}`}
                                    className="text-sm text-gray-700 cursor-pointer flex-1"
                                  >
                                    {group}
                                  </label>
                                  <span className="text-xs text-gray-400 min-w-[12px]">
                                    {selectedGroups.includes(group) ? "1" : ""}
                                  </span>
                                </div>
                              ))}

                              {/* No group yet option */}
                              <div className="pt-2 border-t border-gray-100">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id="no-group"
                                    checked={selectedGroups.includes(
                                      "No group yet"
                                    )}
                                    onCheckedChange={(checked) =>
                                      handleGroupSelection(
                                        "No group yet",
                                        !!checked
                                      )
                                    }
                                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                  />
                                  <label
                                    htmlFor="no-group"
                                    className="text-sm text-gray-500 cursor-pointer flex-1 italic"
                                  >
                                    No group yet
                                  </label>
                                  <span className="text-xs text-gray-400 min-w-[12px]">
                                    {selectedGroups.includes("No group yet")
                                      ? "1"
                                      : ""}
                                  </span>
                                </div>
                              </div>

                              {filteredGroups.length === 0 &&
                                !searchGroup.includes("no group") && (
                                  <p className="text-sm text-gray-500 text-center py-2">
                                    No groups found
                                  </p>
                                )}
                            </div>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 ml-auto">
                      <Input
                        placeholder="Search by name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-80 sm:w-full"
                      />
                      <Button
                        className="border-blue-500 text-blue-500 hover:text-blue-600"
                        variant="outline"
                      >
                        APPLY FILTER
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="border border-gray-300 rounded-md overflow-hidden bg-white">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Memuat data pengguna...</p>
                </div>
              ) : apiError ? (
                <div className="p-8 text-center text-red-500">
                  <p>{apiError}</p>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No members found matching your search.</p>
                </div>
              ) : (
                <div className="w-full">
                  {/* Desktop View - Pas de scroll */}
                  <div className="hidden md:block w-full border border-gray-200 rounded-lg">
                    {/* Header Desktop */}
                    <div className="grid grid-cols-[50px_1fr_1fr_150px_150px_120px_60px] gap-4 p-4 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-sm">
                      <div className="flex justify-center items-center">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                      </div>
                      <div className="flex items-center">NAME</div>
                      <div className="flex items-center">EMAIL</div>
                      <div className="flex items-center">BILLABLE RATE</div>
                      <div className="flex items-center">ROLE</div>
                      <div className="flex items-center">GROUP</div>
                      <div className="flex items-center justify-center">
                        {"     "}
                      </div>
                    </div>

                    {/* Corps Desktop */}
                    <div className="divide-y divide-gray-200">
                      {filteredMembers.map((member) => (
                        <div
                          key={member.id}
                          className={`grid grid-cols-[50px_1fr_1fr_150px_150px_120px_60px] gap-4 p-4 hover:bg-gray-50 transition-colors items-center ${
                            selectedMembers.includes(member.id)
                              ? "bg-blue-50"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex justify-center">
                            <Checkbox
                              checked={selectedMembers.includes(member.id)}
                              onCheckedChange={(checked) =>
                                handleMemberSelection(member.id, !!checked)
                              }
                              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 font-medium truncate">
                                {member.name}
                              </span>
                              {!member.joined && (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                                  not joined
                                </span>
                              )}
                              {member.isYou && (
                                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded whitespace-nowrap">
                                  you
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <span className="text-gray-600 truncate block">
                              {member.email}
                            </span>
                          </div>

                          <div>
                            <button className="text-blue-500 hover:text-blue-700 text-sm hover:underline transition-colors">
                              {member.billableRate}
                            </button>
                          </div>

                          <div>
                            <button className="text-blue-500 hover:text-blue-700 text-sm hover:underline transition-colors">
                              {member.role}
                            </button>
                          </div>

                          <div>
                            <button className="text-blue-500 hover:text-blue-700 text-sm hover:underline transition-colors truncate">
                              {member.group}
                            </button>
                          </div>

                          <div className="flex justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded transition-colors">
                                  <EllipsisVertical className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-36 bg-white border border-gray-200 shadow-lg rounded-md"
                                align="end"
                                sideOffset={4}
                              >
                                <DropdownMenuItem
                                  className="text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => handleEditProfile(member)}
                                >
                                  Edit profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                                  onClick={() => handleEditPIN(member)}
                                >
                                  Edit PIN
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile View - Avec scroll horizontal */}
                  <div className="block md:hidden w-full border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <div className="min-w-[700px]">
                        {/* Header Mobile */}
                        <div className="grid grid-cols-[40px_140px_180px_100px_100px_80px_50px] gap-2 p-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-700 text-xs">
                          <div className="flex justify-center items-center">
                            <Checkbox
                              checked={selectAll}
                              onCheckedChange={handleSelectAll}
                              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 h-3 w-3"
                            />
                          </div>
                          <div className="flex items-center">NAME</div>
                          <div className="flex items-center">EMAIL</div>
                          <div className="flex items-center">RATE</div>
                          <div className="flex items-center">ROLE</div>
                          <div className="flex items-center">GROUP</div>
                          <div className="flex items-center justify-center">
                            ACT
                          </div>
                        </div>

                        {/* Corps Mobile */}
                        <div className="divide-y divide-gray-200">
                          {filteredMembers.map((member) => (
                            <div
                              key={member.id}
                              className={`grid grid-cols-[40px_140px_180px_100px_100px_80px_50px] gap-2 p-3 hover:bg-gray-50 transition-colors text-xs ${
                                selectedMembers.includes(member.id)
                                  ? "bg-blue-50"
                                  : "bg-white"
                              }`}
                            >
                              {/* Checkbox */}
                              <div className="flex justify-center items-center">
                                <Checkbox
                                  checked={selectedMembers.includes(member.id)}
                                  onCheckedChange={(checked) =>
                                    handleMemberSelection(member.id, !!checked)
                                  }
                                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 h-3 w-3"
                                />
                              </div>

                              {/* Name */}
                              <div className="flex flex-col justify-center min-w-0">
                                <span className="text-gray-900 font-medium truncate text-xs">
                                  {member.name}
                                </span>
                                <div className="flex gap-1 mt-0.5">
                                  {!member.joined && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded text-[10px]">
                                      pending
                                    </span>
                                  )}
                                  {member.isYou && (
                                    <span className="text-xs text-blue-600 bg-blue-100 px-1 py-0.5 rounded text-[10px]">
                                      you
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Email */}
                              <div className="flex items-center min-w-0">
                                <span className="text-gray-600 truncate text-xs">
                                  {member.email}
                                </span>
                              </div>

                              {/* Billable Rate */}
                              <div className="flex items-center">
                                <button className="text-blue-500 hover:text-blue-700 text-xs hover:underline transition-colors truncate">
                                  {member.billableRate}
                                </button>
                              </div>

                              {/* Role */}
                              <div className="flex items-center">
                                <button className="text-blue-500 hover:text-blue-700 text-xs hover:underline transition-colors truncate">
                                  {member.role}
                                </button>
                              </div>

                              {/* Group */}
                              <div className="flex items-center">
                                <button className="text-blue-500 hover:text-blue-700 text-xs hover:underline transition-colors truncate">
                                  {member.group}
                                </button>
                              </div>

                              {/* Actions Dropdown */}
                              <div className="flex justify-center items-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors">
                                      <EllipsisVertical className="w-3 h-3" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    className="w-32 bg-white border border-gray-200 shadow-lg rounded-md"
                                    align="end"
                                    sideOffset={4}
                                  >
                                    <DropdownMenuItem
                                      className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer py-2"
                                      onClick={() => handleEditProfile(member)}
                                    >
                                      Edit profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-xs text-gray-700 hover:bg-gray-50 cursor-pointer py-2"
                                      onClick={() => handleEditPIN(member)}
                                    >
                                      Edit PIN
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer avec informations de sélection */}
                  {selectedMembers.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-700">
                          {selectedMembers.length} member
                          {selectedMembers.length > 1 ? "s" : ""} selected
                        </p>
                        <button
                          onClick={() => {
                            setSelectedMembers([]);
                            setSelectAll(false);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Clear selection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        );
      case "limited":
        return (
          <div className="p-6 text-center text-gray-500">
            <p>Limited members content will be displayed here.</p>
          </div>
        );
      case "groups":
        return (
          <div className="p-6 text-center text-gray-500">
            <p>Groups content will be displayed here.</p>
          </div>
        );
      case "reminders":
        return (
          <div className="p-6 text-center text-gray-500">
            <p>Reminders content will be displayed here.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6 mt-15">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl md:text-2xl font-bold text-gray-400 mb-4 md:mb-6">
          Team
        </h1>

        <div className="flex space-x-4 md:space-x-8 mb-4 md:mb-6 overflow-x-auto">
          <Button
            variant="ghost"
            className={`md:px-0 font-medium whitespace-nowrap ${
              activeTab === "full"
                ? "bg-gray-400 w-20 hover:bg-gray-400"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("full")}
          >
            FULL
          </Button>
          <Button
            variant="ghost"
            className={`px-2 md:px-0 font-medium whitespace-nowrap ${
              activeTab === "limited"
                ? "bg-gray-400 w-20 hover:bg-gray-400"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("limited")}
          >
            LIMITED
          </Button>
          <Button
            variant="ghost"
            className={`px-2 md:px-0 font-medium whitespace-nowrap ${
              activeTab === "groups"
                ? "bg-gray-400 w-20 hover:bg-gray-400"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            GROUPS
          </Button>
          <Button
            variant="ghost"
            className={`px-2 md:px-0 font-medium whitespace-nowrap ${
              activeTab === "reminders"
                ? "bg-gray-400 w-20 hover:bg-gray-400"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("reminders")}
          >
            REMINDERS
          </Button>
        </div>

        <Separator className="my-4 md:my-6 bg-gray-200" />

        {renderTabContent()}
      </div>
    </div>
  );
}
