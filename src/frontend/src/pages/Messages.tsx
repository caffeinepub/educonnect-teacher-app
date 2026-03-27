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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Plus, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Message } from "../backend";
import { useActor } from "../hooks/useActor";

const TEACHER_ID = "teacher001";
const TEACHER_NAME = "Ms. Sarah Johnson";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Messages() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [selectedThread, setSelectedThread] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({
    recipientId: "",
    recipientName: "",
    subject: "",
    body: "",
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", TEACHER_ID],
    queryFn: () => actor!.getMessages(TEACHER_ID),
    enabled: !!actor,
  });

  const { data: threadMessages } = useQuery({
    queryKey: ["messages", "thread", TEACHER_ID, selectedThread?.userId],
    queryFn: () => actor!.getMessageThread(TEACHER_ID, selectedThread!.userId),
    enabled: !!actor && !!selectedThread,
  });

  const sendMutation = useMutation({
    mutationFn: (opts: {
      to: string;
      toName: string;
      subject: string;
      body: string;
    }) =>
      actor!.sendMessage(
        TEACHER_ID,
        TEACHER_NAME,
        opts.to,
        opts.toName,
        opts.subject,
        opts.body,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message sent!");
      setReplyBody("");
      setComposeOpen(false);
      setComposeForm({
        recipientId: "",
        recipientName: "",
        subject: "",
        body: "",
      });
    },
    onError: () => toast.error("Failed to send"),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => actor!.markMessageRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages"] }),
  });

  // Group messages by conversation partner
  const conversations = (() => {
    if (!messages) return [];
    const byPartner: Record<
      string,
      {
        partnerId: string;
        partnerName: string;
        latest: Message;
        unread: number;
      }
    > = {};
    for (const msg of messages) {
      const partnerId =
        msg.senderId === TEACHER_ID ? msg.recipientId : msg.senderId;
      const partnerName =
        msg.senderId === TEACHER_ID ? msg.recipientName : msg.senderName;
      if (!byPartner[partnerId]) {
        byPartner[partnerId] = {
          partnerId,
          partnerName,
          latest: msg,
          unread: 0,
        };
      } else {
        if (msg.sentDate > byPartner[partnerId].latest.sentDate) {
          byPartner[partnerId].latest = msg;
        }
      }
      if (!msg.isRead && msg.recipientId === TEACHER_ID) {
        byPartner[partnerId].unread++;
      }
    }
    return Object.values(byPartner).sort((a, b) =>
      b.latest.sentDate.localeCompare(a.latest.sentDate),
    );
  })();

  const openThread = (partnerId: string, partnerName: string) => {
    setSelectedThread({ userId: partnerId, name: partnerName });
    // Mark unread messages as read
    messages
      ?.filter((m) => m.senderId === partnerId && !m.isRead)
      .map((m) => markReadMutation.mutate(m.id));
  };

  if (selectedThread) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        {/* Thread header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => setSelectedThread(null)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
            {getInitials(selectedThread.name)}
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              {selectedThread.name}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {(threadMessages ?? []).map((msg) => {
            const isMe = msg.senderId === TEACHER_ID;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border rounded-bl-sm"
                  }`}
                >
                  {msg.subject && (
                    <div
                      className={`text-xs font-semibold mb-1 ${isMe ? "opacity-70" : "text-primary"}`}
                    >
                      {msg.subject}
                    </div>
                  )}
                  <div className="text-sm">{msg.body}</div>
                  <div
                    className={`text-xs mt-1 ${isMe ? "opacity-60" : "text-muted-foreground"}`}
                  >
                    {msg.sentDate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply box */}
        <div className="flex items-end gap-2">
          <Textarea
            placeholder="Type a reply..."
            rows={2}
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            className="flex-1 resize-none"
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() =>
              sendMutation.mutate({
                to: selectedThread.userId,
                toName: selectedThread.name,
                subject: "Re: Message",
                body: replyBody,
              })
            }
            disabled={!replyBody.trim() || sendMutation.isPending}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setComposeOpen(true)} size="sm">
          <Plus size={16} className="mr-2" />
          New Message
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              type="button"
              key={conv.partnerId}
              onClick={() => openThread(conv.partnerId, conv.partnerName)}
              className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/30 hover:shadow-card transition-all text-left"
            >
              <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-bold shrink-0">
                {getInitials(conv.partnerName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">
                    {conv.partnerName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {conv.latest.sentDate}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.latest.subject}: {conv.latest.body}
                </div>
              </div>
              {conv.unread > 0 && (
                <Badge className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs p-0 shrink-0">
                  {conv.unread}
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Compose dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Recipient Name</Label>
              <Input
                placeholder="e.g. Parent of John"
                value={composeForm.recipientName}
                onChange={(e) =>
                  setComposeForm({
                    ...composeForm,
                    recipientName: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Recipient ID</Label>
              <Input
                placeholder="e.g. parent001"
                value={composeForm.recipientId}
                onChange={(e) =>
                  setComposeForm({
                    ...composeForm,
                    recipientId: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input
                placeholder="Message subject"
                value={composeForm.subject}
                onChange={(e) =>
                  setComposeForm({ ...composeForm, subject: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea
                placeholder="Write your message..."
                rows={4}
                value={composeForm.body}
                onChange={(e) =>
                  setComposeForm({ ...composeForm, body: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                sendMutation.mutate({
                  to: composeForm.recipientId,
                  toName: composeForm.recipientName,
                  subject: composeForm.subject,
                  body: composeForm.body,
                })
              }
              disabled={
                !composeForm.recipientId ||
                !composeForm.body ||
                sendMutation.isPending
              }
            >
              <Send size={14} className="mr-2" />
              {sendMutation.isPending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
