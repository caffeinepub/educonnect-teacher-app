import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  name: string;
  role: string;
  subject: string;
  school: string;
  phone: string;
  bio: string;
  createdAt: string;
}

const STORAGE_KEY = "teachment_profiles";

function loadProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProfiles(profiles: UserProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

const roleBadgeClass: Record<string, string> = {
  Teacher: "bg-primary/15 text-primary border-primary/30",
  Student: "bg-accent/15 text-accent-foreground border-accent/30",
  Parent: "bg-emerald-500/15 text-emerald-700 border-emerald-400/30",
  Admin: "bg-orange-500/15 text-orange-700 border-orange-400/30",
};

export default function Profile() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "Teacher",
    subject: "",
    school: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    const stored = loadProfiles();
    setProfiles(stored);
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      role: "Teacher",
      subject: "",
      school: "",
      phone: "",
      bio: "",
    });
    setEditingId(null);
  };

  const handleEdit = (profile: UserProfile) => {
    setForm({
      name: profile.name,
      role: profile.role,
      subject: profile.subject,
      school: profile.school,
      phone: profile.phone,
      bio: profile.bio,
    });
    setEditingId(profile.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    const stored = loadProfiles();
    let updated: UserProfile[];

    if (editingId) {
      updated = stored.map((p) => (p.id === editingId ? { ...p, ...form } : p));
      toast.success("Profile updated!");
    } else {
      const newProfile: UserProfile = {
        id: crypto.randomUUID(),
        ...form,
        createdAt: new Date().toISOString(),
      };
      updated = [newProfile, ...stored];
      toast.success("Profile created!");
    }

    saveProfiles(updated);
    setProfiles(updated);
    resetForm();
    setIsSaving(false);
  };

  const handleDelete = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    saveProfiles(updated);
    setProfiles(updated);
    if (editingId === id) resetForm();
    toast.success("Profile deleted.");
  };

  const initials = form.name ? getInitials(form.name) : "?";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <UserCircle size={22} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {editingId ? "Edit Profile" : "Create Profile"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {editingId
              ? "Update your profile details"
              : "Add a new profile to Teachment"}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="rounded-2xl border-border shadow-sm">
        <CardContent className="pt-6 space-y-6">
          {/* Avatar preview */}
          <div className="flex flex-col items-center gap-3 pb-4 border-b border-border">
            <Avatar className="w-20 h-20 text-2xl">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">
              {form.name || "Your name will appear here"}
            </p>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="profile-name">Full Name *</Label>
              <Input
                id="profile-name"
                data-ocid="profile.input"
                placeholder="e.g. Umar Khan"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-role">Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
              >
                <SelectTrigger id="profile-role" data-ocid="profile.select">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Teacher">Teacher</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Parent">Parent</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-subject">Subject</Label>
              <Input
                id="profile-subject"
                data-ocid="profile.input"
                placeholder="e.g. Mathematics"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-school">School</Label>
              <Input
                id="profile-school"
                placeholder="e.g. Islamabad Model School"
                value={form.school}
                onChange={(e) =>
                  setForm((f) => ({ ...f, school: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                placeholder="e.g. +92 300 1234567"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="profile-bio">Bio</Label>
              <Textarea
                id="profile-bio"
                data-ocid="profile.textarea"
                placeholder="Write a short bio..."
                rows={3}
                value={form.bio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bio: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              data-ocid="profile.submit_button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSaving
                ? "Saving..."
                : editingId
                  ? "Update Profile"
                  : "Save Profile"}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                data-ocid="profile.cancel_button"
                onClick={resetForm}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profiles List */}
      {profiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">
            All Profiles
          </h2>
          <div className="space-y-3">
            {profiles.map((profile, idx) => (
              <Card
                key={profile.id}
                data-ocid={`profile.item.${idx + 1}`}
                className="rounded-xl border-border hover:shadow-md transition-shadow"
              >
                <CardContent className="py-4 px-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {getInitials(profile.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {profile.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${roleBadgeClass[profile.role] ?? ""}`}
                        >
                          {profile.role}
                        </Badge>
                      </div>
                      {profile.school && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {profile.school}
                        </p>
                      )}
                      {profile.subject && (
                        <p className="text-xs text-muted-foreground">
                          {profile.subject}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        data-ocid={`profile.edit_button.${idx + 1}`}
                        onClick={() => handleEdit(profile)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        data-ocid={`profile.delete_button.${idx + 1}`}
                        onClick={() => handleDelete(profile.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground mt-3 pl-16 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {profiles.length === 0 && (
        <div
          data-ocid="profile.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          <UserCircle size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            No profiles yet. Create the first one above!
          </p>
        </div>
      )}
    </div>
  );
}
