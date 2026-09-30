"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SearchableDropbox, type DropboxOption } from "@/components/ui/searchable-dropbox";
import { Mail, MessageSquare, Bell, Save, CircleDot } from "lucide-react";
import {
  getNotificationTemplates,
  saveTemplate,
  templateEnabledCount,
  NOTIFY_CHANNEL_OPTIONS,
  type NotificationTemplate,
  type NotifyChannel,
} from "@/lib/data/notification-templates";
import { useOps } from "@/lib/data/ops";
import { useToast } from "@/components/app-feedback";

const CHANNEL_ICON: Record<NotifyChannel, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  sms: MessageSquare,
  push: Bell,
};

export default function SettingsNotificationsPage() {
  const appToast = useToast();
  useOps();

  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState("all");
  const [draft, setDraft] = useState<NotificationTemplate | null>(null);

  useEffect(() => {
    let alive = true;
    getNotificationTemplates().then((t) => {
      if (!alive) return;
      setTemplates(t);
      const first = t[0] ?? null;
      setSelectedId(first?.id ?? null);
      setDraft(first ? { ...first } : null);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(
    () => templates.filter((t) => channelFilter === "all" || t.channel === channelFilter),
    [templates, channelFilter]
  );

  // Select a template for editing and seed the draft from its saved values.
  const selectTemplate = (t: NotificationTemplate) => {
    setSelectedId(t.id);
    setDraft({ ...t });
  };

  const dirty = draft !== null && templates.find((t) => t.id === draft.id) !== undefined &&
    JSON.stringify(draft) !== JSON.stringify(templates.find((t) => t.id === draft.id));

  const save = () => {
    if (!draft) return;
    saveTemplate(draft.id, { subject: draft.subject, body: draft.body, enabled: draft.enabled });
    const saved = { ...draft };
    setTemplates((prev) => prev.map((t) => (t.id === draft.id ? saved : t)));
    setDraft(saved);
    appToast.success("Template saved", `“${draft.event}” was updated.`);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Notification Templates</h1>
          <p className="text-sm text-muted-foreground">
            Transactional messages sent for each business event across email, SMS and push.
          </p>
        </div>
        <Badge variant="outline" className="w-fit text-xs font-semibold px-2.5 py-1">
          {templateEnabledCount(templates)} of {templates.length} enabled
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Template list */}
        <Card className="p-4 shadow-xs border-border/80 lg:col-span-1 space-y-3">
          <div className="w-full">
            <SearchableDropbox
              label="Channel"
              options={NOTIFY_CHANNEL_OPTIONS as DropboxOption[]}
              value={channelFilter}
              onChange={setChannelFilter}
              placeholder="All channels..."
              searchPlaceholder="Search channel..."
            />
          </div>
          <Separator />
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : (
            <div className="space-y-1.5">
              {visible.map((t) => {
                const Icon = CHANNEL_ICON[t.channel];
                const active = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectTemplate(t)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all cursor-pointer active:scale-[0.99]",
                      active ? "border-primary/40 bg-primary/5" : "border-border/70 bg-card hover:bg-muted/40"
                    )}
                  >
                    <span className={cn("h-8 w-8 rounded-md flex items-center justify-center shrink-0", t.enabled ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground")}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-sm text-foreground truncate">{t.event}</span>
                      <span className="block text-xs text-muted-foreground uppercase tracking-wide">{t.channel}</span>
                    </span>
                    {active && <CircleDot className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
              {visible.length === 0 && (
                <p className="text-sm text-muted-foreground px-2 py-4">No templates for this channel.</p>
              )}
            </div>
          )}
        </Card>

        {/* Editor */}
        <Card className="p-6 shadow-xs border-border/80 lg:col-span-2 space-y-5">
          {!draft ? (
            <div className="py-16 text-center text-sm text-muted-foreground">Select a template to edit.</div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h2 className="text-lg font-semibold text-foreground">{draft.event}</h2>
                  <p className="text-xs text-muted-foreground">Delivery channel: <span className="uppercase font-semibold">{draft.channel}</span></p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Label htmlFor="nt-enabled" className="text-sm font-medium text-muted-foreground cursor-pointer">
                    {draft.enabled ? "Enabled" : "Disabled"}
                  </Label>
                  <Switch
                    id="nt-enabled"
                    checked={draft.enabled}
                    onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <Separator />

              {draft.channel !== "sms" && (
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Subject</Label>
                  <Input
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                    className="h-11"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Message Body</Label>
                <Textarea
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  rows={10}
                  className="font-mono text-sm resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  Placeholders like <code className="font-mono">{"{{ customer.name }}"}</code> and <code className="font-mono">{"{{ order.id }}"}</code> are merged at send time.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                {dirty ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Unsaved changes
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">All changes saved</span>
                )}
                <Button
                  className="h-10 px-5 text-sm font-medium cursor-pointer active:scale-[0.98] transition-all"
                  onClick={save}
                  disabled={!dirty}
                >
                  <Save className="mr-2 h-4 w-4" /> Save Template
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
