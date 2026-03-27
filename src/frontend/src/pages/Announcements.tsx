import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export default function Announcements() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [postOpen, setPostOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", classId: "" });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => actor!.getAnnouncements(),
    enabled: !!actor,
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => actor!.getClasses(),
    enabled: !!actor,
  });

  const postMutation = useMutation({
    mutationFn: () =>
      actor!.addAnnouncement(
        form.title,
        form.body,
        form.classId,
        "Ms. Sarah Johnson",
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement posted!");
      setPostOpen(false);
      setForm({ title: "", body: "", classId: "" });
    },
    onError: () => toast.error("Failed to post"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => actor!.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });

  const getClassName = (classId: string) => {
    if (!classId) return "All Classes";
    return classes?.find((c) => c.id === classId)?.name ?? classId;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setPostOpen(true)} size="sm">
          <Plus size={16} className="mr-2" />
          Post Announcement
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (announcements ?? []).length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
          <p>No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(announcements ?? []).map((ann) => (
            <div
              key={ann.id}
              className="bg-card border border-border rounded-xl p-4 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <Megaphone size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      {ann.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {ann.body}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {getClassName(ann.classId)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {ann.createdDate}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        by {ann.authorName}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(ann.id)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Dialog */}
      <Dialog open={postOpen} onOpenChange={setPostOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Post Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="Announcement title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea
                placeholder="Write your announcement..."
                rows={4}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Target</Label>
              <Select
                value={form.classId}
                onValueChange={(v) => setForm({ ...form, classId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Classes</SelectItem>
                  {(classes ?? []).map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPostOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => postMutation.mutate()}
              disabled={!form.title || !form.body || postMutation.isPending}
            >
              {postMutation.isPending ? "Posting..." : "Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
