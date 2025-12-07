"use client";

import React, { useState, useEffect } from "react";
import { adminService, projectService, profileService } from "@/lib/api";
import type { User, Project as ApiProject, CreateProjectRequest, BudgetType, Profile } from "@/lib/api/types";
import {
  X,
  Search,
  ChevronDown,
  Star,
  MoreHorizontal,
  Plus,
  Check,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Project {
  id: number;
  name: string;
  client: string;
  tracked: string;
  amount: string;
  progress: string;
  access: "Public" | "Private";
  color: string;
  starred: boolean;
}

interface Filters {
  active: string;
  client: string;
  access: string;
  billing: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface FilterOptions {
  active: FilterOption[];
  client: FilterOption[];
  access: FilterOption[];
  billing: FilterOption[];
}

interface NewProject {
  name: string;
  client_name: string;
  client_email: string;
  budget_type: BudgetType;
  // Project Based fields
  budgeted_hours: string;
  hour_threshold: string;
  budget_cost: string;
  budget_cost_threshold: string;
  budget_revenue: string;
  // User Based fields
  cost_per_hour: string;
  rate_per_hour: string;
}


const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [apiProjects, setApiProjects] = useState<ApiProject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(
    null
  );
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    active: "Active",
    client: "Client",
    access: "Access",
    billing: "Billing",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newProject, setNewProject] = useState<NewProject>({
    name: "",
    client_name: "",
    client_email: "",
    budget_type: "project_based",
    budgeted_hours: "",
    hour_threshold: "",
    budget_cost: "",
    budget_cost_threshold: "",
    budget_revenue: "",
    cost_per_hour: "",
    rate_per_hour: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);

  // Fetch current user profile to check role
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await profileService.getProfile();
        setCurrentUser(profile);
        setIsAdmin(profile.role === "admin");
        setIsEmployee(profile.role === "employee");
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setIsAdmin(false);
        setIsEmployee(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const fetchedProjects = await projectService.getAllProjects();
        setApiProjects(fetchedProjects);
        
        // Map API projects to display format with safe defaults
        const mappedProjects: Project[] = fetchedProjects
          .filter((p: ApiProject) => p && typeof p === 'object' && p.id)
          .map((p: ApiProject) => ({
            id: Number(p.id) || 0,
            name: String(p.name || "Untitled Project"),
            client: String(p.client_name || "–"),
            tracked: "0,00h", // TODO: Calculate from timesheet data
            amount: "0,00 USD", // TODO: Calculate from budget
            progress: "–", // TODO: Calculate progress
            access: "Public" as "Public" | "Private", // TODO: Get from project settings
            color: "#10B981", // Default color
            starred: false,
          }));
        
        setProjects(mappedProjects);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch users for filter dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const fetchedUsers = await adminService.getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const filterOptions: FilterOptions = {
    active: [
      { label: "Active", value: "active" },
      { label: "Archived", value: "archived" },
      { label: "All", value: "All" },
    ],
    client: [
      { label: "All Clients", value: "all" },
      { label: "Client A", value: "client-a" },
      { label: "Client B", value: "client-b" },
      { label: "Client C", value: "client-c" },
      { label: "Acme Corp", value: "acme-corp" },
      { label: "Tech Solutions", value: "tech-solutions" },
    ],
    access: [
      { label: "All Access", value: "all" },
      { label: "Public", value: "public" },
      { label: "Private", value: "private" },
      { label: "Team", value: "team" },
    ],
    billing: [
      { label: "Billable", value: "billable" },
      { label: "Non billable", value: "non-billable" },
    ],
  };

  const validateProjectForm = (): boolean => {
    if (!newProject.name.trim()) {
      setCreateError("Nama project harus diisi");
      return false;
    }
    if (!newProject.client_name.trim()) {
      setCreateError("Nama client harus diisi");
      return false;
    }

    if (newProject.budget_type === "project_based") {
      if (!newProject.budgeted_hours.trim()) {
        setCreateError("Budgeted hours harus diisi");
        return false;
      }
      if (!newProject.hour_threshold.trim()) {
        setCreateError("Hour threshold harus diisi");
        return false;
      }
      if (!newProject.budget_cost.trim()) {
        setCreateError("Budget cost harus diisi");
        return false;
      }
      if (!newProject.budget_cost_threshold.trim()) {
        setCreateError("Budget cost threshold harus diisi");
        return false;
      }
      if (!newProject.budget_revenue.trim()) {
        setCreateError("Budget revenue harus diisi");
        return false;
      }
    } else if (newProject.budget_type === "user_based") {
      if (!newProject.cost_per_hour.trim()) {
        setCreateError("Cost per hour harus diisi");
        return false;
      }
      if (!newProject.rate_per_hour.trim()) {
        setCreateError("Rate per hour harus diisi");
        return false;
      }
    }

    return true;
  };

  const handleCreateProject = async (): Promise<void> => {
    setCreateError(null);

    if (!validateProjectForm()) {
      return;
    }

    if (!isAdmin) {
      setCreateError("Hanya admin yang dapat membuat project");
      return;
    }

    setIsCreating(true);

    try {
      const projectData: CreateProjectRequest = {
        name: newProject.name.trim(),
        client_name: newProject.client_name.trim(),
        client_email: newProject.client_email.trim() || null,
        budget_type: newProject.budget_type,
      };

      if (newProject.budget_type === "project_based") {
        projectData.budgeted_hours = parseInt(newProject.budgeted_hours) || null;
        projectData.hour_threshold = parseInt(newProject.hour_threshold) || null;
        projectData.budget_cost = parseInt(newProject.budget_cost) || null;
        projectData.budget_cost_threshold = parseInt(newProject.budget_cost_threshold) || null;
        projectData.budget_revenue = parseInt(newProject.budget_revenue) || null;
      } else {
        projectData.cost_per_hour = parseInt(newProject.cost_per_hour) || null;
        projectData.rate_per_hour = parseInt(newProject.rate_per_hour) || null;
      }

      const createdProject = await projectService.createProject(projectData);

      // Validate created project response
      if (!createdProject || !createdProject.id) {
        throw new Error("Invalid response from server");
      }

      // Refresh projects list from API to ensure consistency
      try {
        const fetchedProjects = await projectService.getAllProjects();
        if (!Array.isArray(fetchedProjects)) {
          throw new Error("Invalid projects data format");
        }
        
        setApiProjects(fetchedProjects);
        
        // Map API projects to display format with safe defaults
        const mappedProjects: Project[] = fetchedProjects
          .filter((p: ApiProject) => p && typeof p === 'object' && p.id)
          .map((p: ApiProject) => ({
            id: Number(p.id) || 0,
            name: String(p.name || "Untitled Project"),
            client: String(p.client_name || "–"),
            tracked: "0,00h", // TODO: Calculate from timesheet data
            amount: "0,00 USD", // TODO: Calculate from budget
            progress: "–", // TODO: Calculate progress
            access: "Public" as "Public" | "Private", // TODO: Get from project settings
            color: "#10B981", // Default color
            starred: false,
          }));
        
        setProjects(mappedProjects);
      } catch (refreshError) {
        console.error("Failed to refresh projects after create:", refreshError);
        // Show error but don't prevent modal from closing
        setCreateError("Project created but failed to refresh list. Please refresh the page.");
      }
      
      setIsModalOpen(false);
      setNewProject({
        name: "",
        client_name: "",
        client_email: "",
        budget_type: "project_based",
        budgeted_hours: "",
        hour_threshold: "",
        budget_cost: "",
        budget_cost_threshold: "",
        budget_revenue: "",
        cost_per_hour: "",
        rate_per_hour: "",
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null && 'message' in err
        ? String(err.message)
        : "Gagal membuat project";
      setCreateError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleStar = (projectId: number): void => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === projectId
          ? { ...project, starred: !project.starred }
          : project
      )
    );
  };

  const handleInputChange = (
    field: keyof NewProject,
    value: string
  ): void => {
    setNewProject((prev) => ({ ...prev, [field]: value }));
    if (createError) setCreateError(null);
  };

  const handleBudgetTypeChange = (value: BudgetType): void => {
    setNewProject((prev) => ({
      ...prev,
      budget_type: value,
      // Clear fields when switching budget type
      budgeted_hours: "",
      hour_threshold: "",
      budget_cost: "",
      budget_cost_threshold: "",
      budget_revenue: "",
      cost_per_hour: "",
      rate_per_hour: "",
    }));
  };

  const handleFilterChange = (
    filterType: keyof Filters,
    option: FilterOption
  ): void => {
    setFilters((prev) => ({ ...prev, [filterType]: option.label }));
    setOpenFilterDropdown(null);
  };

  const toggleFilterDropdown = (filterType: string): void => {
    setOpenFilterDropdown(
      openFilterDropdown === filterType ? null : filterType
    );
  };

  const filteredProjects: Project[] = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-filter-dropdown]")) {
        setOpenFilterDropdown(null);
      }
    };

    if (openFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openFilterDropdown]);

  return (
    <div className="min-h-screen bg-gray-50 mt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          {!isEmployee && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              CREATE NEW PROJECT
            </button>
          )}
        </div>
      </div>

      {/* Filters and Search - Hidden for employee */}
      {!isEmployee && (
      <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              FILTER
            </span>

            {Object.entries(filters).map(([key, value]: [string, string]) => (
              <div key={key} className="relative" data-filter-dropdown>
                <button
                  type="button"
                  onClick={() => toggleFilterDropdown(key)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <span className="capitalize">{value}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      openFilterDropdown === key ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFilterDropdown === key && (
                  <div className="absolute top-full left-0 mt-2 min-w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {key === "client" ? (
                      // Menu spécial pour les clients
                      <div className="py-2">
                        {/* Section 1: Input de recherche */}
                        <div className="px-4 pb-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              placeholder="Search clients..."
                              className="h-8 pl-10"
                            />
                          </div>
                        </div>

                        {/* Section 2: Bannière avec Show/Active */}
                        <div className="px-4 py-2 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Show</span>
                            <Select
                              defaultValue="active"
                              onOpenChange={setIsSelectOpen}
                            >
                              <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent shadow-none text-sm text-gray-700 hover:text-gray-900">
                                <div className="flex items-center gap-1">
                                  <SelectValue />
                                  {isSelectOpen ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                  Inactive
                                </SelectItem>
                                <SelectItem value="all">All</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Section 3: Message "No client yet" */}
                        <div className="px-4 py-6 border-t border-gray-100">
                          <div className="flex justify-center items-center">
                            <p className="text-sm text-gray-500">
                              No client yet
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : key === "access" ? (
                      // Menu spécial pour access
                      <div className="py-2">
                        {/* Section 1: Input de recherche */}
                        <div className="px-4 pb-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              placeholder="Search access..."
                              className="h-8 pl-10"
                            />
                          </div>
                        </div>

                        {/* Section 2: Bannière avec Show/Active */}
                        <div className="px-4 py-2 border-t border-gray-100">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Show</span>
                            <Select
                              defaultValue="active"
                              onOpenChange={setIsSelectOpen}
                            >
                              <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent shadow-none text-sm text-gray-700 hover:text-gray-900">
                                <div className="flex items-center gap-1">
                                  <SelectValue />
                                  {isSelectOpen ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                  Inactive
                                </SelectItem>
                                <SelectItem value="all">All</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Section 3: Select all checkbox */}
                        <div className="px-4 py-3 border-t border-gray-100">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="select-all"
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <label
                              htmlFor="select-all"
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              Select all
                            </label>
                          </div>
                        </div>

                        {/* Section 4: USERS bannière */}
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                            USERS
                          </span>
                        </div>

                        {/* Section 5: User email checkboxes */}
                        <div className="px-4 py-3 max-h-60 overflow-y-auto">
                          {isLoadingUsers ? (
                            <div className="text-sm text-gray-500 text-center py-2">
                              Memuat pengguna...
                            </div>
                          ) : users.length === 0 ? (
                            <div className="text-sm text-gray-500 text-center py-2">
                              Tidak ada pengguna
                            </div>
                          ) : (
                            users.map((user) => (
                              <div key={user.id} className="flex items-center space-x-2 py-1">
                                <Checkbox
                                  id={`user-${user.id}`}
                                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <label
                                  htmlFor={`user-${user.id}`}
                                  className="text-sm text-gray-700 cursor-pointer"
                                >
                                  {user.email}
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      // Menu normal pour les autres filtres
                      <div className="py-2">
                        {filterOptions[key as keyof FilterOptions].map(
                          (option: FilterOption) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                handleFilterChange(key as keyof Filters, option)
                              }
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                value === option.label
                                  ? "text-blue-600 bg-blue-50 font-medium"
                                  : "text-gray-700"
                              }`}
                            >
                              {option.label}
                              {value === option.label && (
                                <Check className="w-4 h-4 float-right mt-0.5 text-blue-600" />
                              )}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Find by name"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
            >
              APPLY FILTER
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Projects Table */}
      <div className="px-4 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-medium text-gray-900">Projects</h2>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Export
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      {!isEmployee && (
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          aria-label="Select all projects"
                        />
                      )}
                      NAME
                      {!isEmployee && <ChevronDown className="w-3 h-3" />}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      CLIENT
                      {!isEmployee && <ChevronDown className="w-3 h-3" />}
                    </div>
                  </th>
                  {!isEmployee && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          TRACKED
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          AMOUNT
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                          PROGRESS
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ACCESS
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <MoreHorizontal className="w-4 h-4" />
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={isEmployee ? 2 : 7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Plus className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="text-gray-500 font-medium">
                          {projects.length === 0
                            ? "No projects yet"
                            : "No projects found"}
                        </div>
                        <div className="text-sm text-gray-400 max-w-sm">
                          {projects.length === 0
                            ? "Create your first project to get started and begin tracking your work."
                            : "Try adjusting your search criteria to find what you're looking for."}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project: Project) => (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {!isEmployee && (
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              aria-label={`Select project ${project.name}`}
                            />
                          )}
                          {!isEmployee && (
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: project.color }}
                            />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {project.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.client}
                      </td>
                      {!isEmployee && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {project.tracked}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {project.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {project.progress}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 font-medium">
                              {project.access}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => toggleStar(project.id)}
                                className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                                  project.starred
                                    ? "text-yellow-400"
                                    : "text-gray-400"
                                }`}
                                aria-label={
                                  project.starred
                                    ? "Remove from favorites"
                                    : "Add to favorites"
                                }
                              >
                                <Star
                                  className="w-4 h-4"
                                  fill={project.starred ? "currentColor" : "none"}
                                />
                              </button>
                              <button
                                type="button"
                                className="p-2 rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
                                aria-label="More options"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40"
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-labelledby="modal-title"
              aria-modal="true"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900"
                >
                  Create new Project
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  handleCreateProject();
                }}
                className="p-6 space-y-6"
              >
                {/* Error Message */}
                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {createError}
                  </div>
                )}

                {/* Project Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Nama Project <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Masukkan nama project"
                    value={newProject.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("name", e.target.value)
                    }
                    required
                    aria-label="Project name"
                  />
                </div>

                {/* Client Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nama Client <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Masukkan nama client"
                      value={newProject.client_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("client_name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email Client (Optional)
                    </label>
                    <Input
                      type="email"
                      placeholder="client@example.com"
                      value={newProject.client_email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("client_email", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Budget Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Tipe Budget <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newProject.budget_type}
                    onValueChange={(value: BudgetType) => handleBudgetTypeChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project_based">Project Based</SelectItem>
                      <SelectItem value="user_based">User Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Project Based Fields */}
                {newProject.budget_type === "project_based" && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Project Based Budget
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Budgeted Hours <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newProject.budgeted_hours}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("budgeted_hours", e.target.value)
                          }
                          required
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Hour Threshold <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newProject.hour_threshold}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("hour_threshold", e.target.value)
                          }
                          required
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Budget Cost (Rp) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newProject.budget_cost}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("budget_cost", e.target.value)
                          }
                          required
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Budget Cost Threshold (Rp) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newProject.budget_cost_threshold}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("budget_cost_threshold", e.target.value)
                          }
                          required
                          min="0"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                          Budget Revenue (Rp) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newProject.budget_revenue}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("budget_revenue", e.target.value)
                          }
                          required
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* User Based Fields */}
                {newProject.budget_type === "user_based" && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700">
                      User Based Budget
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Cost Per Hour (Rp) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newProject.cost_per_hour}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("cost_per_hour", e.target.value)
                          }
                          required
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Rate Per Hour (Rp) <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newProject.rate_per_hour}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleInputChange("rate_per_hour", e.target.value)
                          }
                          required
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors hover:bg-gray-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !isAdmin}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {isCreating ? "Membuat..." : "CREATE"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectsPage;
