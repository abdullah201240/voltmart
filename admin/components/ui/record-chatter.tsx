"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  StickyNote,
  Clock,
  CheckCircle2,
  RotateCcw,
  Calendar,
  Phone,
  Mail,
  Users,
  ListTodo,
  Zap,
  Send,
} from "lucide-react";
import {
  useOps,
  getRecord,
  addMessage,
  scheduleActivity,
  setActivityState,
  type ActivityType,
  type ChatterMessage,
  type HistoryEvent,
} from "@/lib/data/ops";

type ThreadEntry =
  | { kind: "message"; ts: number; data: ChatterMessage }
  | { kind: "history"; ts: number; data: HistoryEvent };

const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "todo", label: "To-Do", icon: ListTodo },
  { value: "phone", label: "Call", icon: Phone },
  { value: "meeting", label: "Meeting", icon: Users },
  { value: "email", label: "Email", icon: Mail },
  { value: "next_activity", label: "Next Activity", icon: Clock },
];

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function isOverdue(due: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(due + "T00:00:00").getTime() < today.getTime();
}

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface RecordChatterProps {
  model: string;
  recordId: string;
  className?: string;
}

export function RecordChatter({ model, recordId, className }: RecordChatterProps) {
  useOps(); // subscribe: re-render on any mutation
  const rec = getRecord(model, recordId);

  const [tab, setTab] = useState<"discuss" | "activities">("discuss");
  const [composer, setComposer] = useState<"comment" | "note">("comment");
  const [body, setBody] = useState("");

  // Activity form
  const [showForm, setShowForm] = useState(false);
  const [aType, setAType] = useState<ActivityType>("todo");
  const [aSummary, setASummary] = useState("");
  const [aDue, setADue] = useState(todayPlus(1));
  const [aAssignee, setAAssignee] = useState("Admin · Alex");

  const entries: ThreadEntry[] = [
    ...rec.messages.map((m) => ({ kind: "message" as const, ts: m.ts, data: m })),
    ...rec.history.map((h) => ({ kind: "history" as const, ts: h.ts, data: h })),
  ].sort((a, b) => b.ts - a.ts);

  const openActs = rec.activities.filter((a) => a.state === "open");
  const doneActs = rec.activities.filter((a) => a.state === "done");

  const post = () => {
    const text = body.trim();
    if (!text) return;
    addMessage(model, recordId, text, composer);
    setBody("");
  };

  const addActivity = () => {
    if (!aSummary.trim()) return;
    scheduleActivity(model, recordId, { type: aType, summary: aSummary.trim(), due: aDue, assignee: aAssignee.trim() || "Admin · Alex" });
    setASummary("");
    setShowForm(false);
  };

  return (
    <div className={cn("rounded-lg border border-border/80 bg-card shadow-xs", className)}>
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border/70 px-2">
        <TabButton active={tab === "discuss"} onClick={() => setTab("discuss")} icon={<MessageSquare className="h-4 w-4" />}>
          Discuss
          {entries.length > 0 && <CountPill>{entries.length}</CountPill>}
        </TabButton>
        <TabButton active={tab === "activities"} onClick={() => setTab("activities")} icon={<Clock className="h-4 w-4" />}>
          Activities
          {openActs.length > 0 && <CountPill tone="amber">{openActs.length}</CountPill>}
        </TabButton>
      </div>

      {tab === "discuss" ? (
        <div className="p-3 sm:p-4 space-y-4">
          {/* Composer */}
          <div className="rounded-md border border-input bg-background">
            <div className="flex items-center gap-1 border-b border-border/60 px-2 pt-1">
              <ComposerTab active={composer === "comment"} onClick={() => setComposer("comment")} icon={<MessageSquare className="h-3.5 w-3.5" />}>
                Send message
              </ComposerTab>
              <ComposerTab active={composer === "note"} onClick={() => setComposer("note")} icon={<StickyNote className="h-3.5 w-3.5" />}>
                Log note
              </ComposerTab>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              placeholder={composer === "comment" ? "Write a message to the customer…" : "Post an internal note (only staff can see)…"}
              className={cn(
                "w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground",
                composer === "note" && "bg-amber-500/5",
              )}
            />
            <div className="flex items-center justify-end gap-2 px-2 pb-2">
              <button
                type="button"
                onClick={post}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 h-9 text-sm font-medium text-primary-foreground transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                disabled={!body.trim()}
              >
                <Send className="h-4 w-4" /> {composer === "comment" ? "Send" : "Log"}
              </button>
            </div>
          </div>

          {/* Thread */}
          {entries.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">No messages or history yet.</p>
          ) : (
            <ul className="space-y-3">
              {entries.map((e) =>
                e.kind === "history" ? (
                  <li key={e.data.id} className="flex items-start gap-2.5 rounded-md bg-muted/40 px-3 py-2">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Zap className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">{e.data.action}</span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(e.data.ts)}</span>
                      </div>
                      {e.data.detail && <p className="mt-0.5 text-xs text-muted-foreground">{e.data.detail}</p>}
                      <p className="mt-0.5 text-[11px] text-muted-foreground">by {e.data.actor}</p>
                    </div>
                  </li>
                ) : (
                  <li
                    key={e.data.id}
                    className={cn(
                      "flex items-start gap-2.5 rounded-md px-3 py-2 border",
                      e.data.kind === "note" ? "bg-amber-500/5 border-amber-500/20" : "bg-background border-border/60",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                        e.data.kind === "note" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-primary/10 text-primary",
                      )}
                    >
                      {e.data.author.replace(/^Admin · /, "").slice(0, 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {e.data.author}
                          {e.data.kind === "note" && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Internal note</span>}
                        </span>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(e.data.ts)}</span>
                      </div>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">{e.data.body}</p>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      ) : (
        <div className="p-3 sm:p-4 space-y-4">
          {/* Schedule form */}
          {showForm ? (
            <div className="space-y-3 rounded-md border border-input bg-background p-3">
              <div className="flex flex-wrap gap-1.5">
                {ACTIVITY_TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = aType === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setAType(t.value)}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 h-8 text-xs font-medium transition-all duration-200 active:scale-[0.98]",
                        active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/40",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" /> {t.label}
                    </button>
                  );
                })}
              </div>
              <input
                value={aSummary}
                onChange={(e) => setASummary(e.target.value)}
                placeholder="Activity summary…"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/50 placeholder:text-muted-foreground"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <input type="date" value={aDue} onChange={(e) => setADue(e.target.value)} className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none" />
                </label>
                <input
                  value={aAssignee}
                  onChange={(e) => setAAssignee(e.target.value)}
                  placeholder="Assigned to"
                  className="h-9 flex-1 min-w-[140px] rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/50"
                />
                <button type="button" onClick={addActivity} className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-3 h-9 text-sm font-medium text-primary-foreground transition-all duration-200 active:scale-[0.98]">
                  <CheckCircle2 className="h-4 w-4" /> Schedule
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="inline-flex cursor-pointer items-center rounded-md border border-border px-3 h-9 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/40">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-3 h-10 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/40 hover:text-foreground"
            >
              <Clock className="h-4 w-4" /> Schedule an activity
            </button>
          )}

          {/* Open activities */}
          {openActs.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open · {openActs.length}</p>
              {openActs.map((a) => {
                const t = ACTIVITY_TYPES.find((x) => x.value === a.type);
                const Icon = t?.icon ?? ListTodo;
                const over = isOverdue(a.due);
                return (
                  <div key={a.id} className="flex items-start gap-2.5 rounded-md border border-border/60 bg-background px-3 py-2">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{a.summary}</p>
                      <p className={cn("text-[11px]", over ? "font-semibold text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>
                        Due {new Date(a.due + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} · {a.assignee}
                        {over && " · OVERDUE"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivityState(model, recordId, a.id, "done")}
                      title="Mark done"
                      className="inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-md border border-border text-emerald-600 transition-all duration-200 hover:bg-emerald-500/10 active:scale-[0.98]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Done activities */}
          {doneActs.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Done · {doneActs.length}</p>
              {doneActs.map((a) => {
                const t = ACTIVITY_TYPES.find((x) => x.value === a.type);
                const Icon = t?.icon ?? ListTodo;
                return (
                  <div key={a.id} className="flex items-start gap-2.5 rounded-md border border-border/50 bg-muted/30 px-3 py-2">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-muted-foreground line-through">{a.summary}</p>
                      <p className="text-[11px] text-muted-foreground">{t?.label} · {a.assignee}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivityState(model, recordId, a.id, "open")}
                      title="Reopen"
                      className="inline-flex cursor-pointer items-center justify-center h-8 w-8 rounded-md border border-border text-muted-foreground transition-all duration-200 hover:bg-muted/40 active:scale-[0.98]"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {rec.activities.length === 0 && !showForm && (
            <p className="py-4 text-center text-xs text-muted-foreground">No activities scheduled.</p>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function ComposerTab({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 border-b-2 px-2 pb-1.5 pt-1 text-xs font-semibold transition-colors",
        active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function CountPill({ children, tone }: { children: React.ReactNode; tone?: "amber" }) {
  return (
    <span
      className={cn(
        "ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
        tone === "amber" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
