import { useState, useEffect, useRef } from "react";
import { differenceInMonths } from "date-fns";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useTranslation, languages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Download, ShieldCheck, Users, Loader2, ChevronDown, ChevronRight, Check, Globe, UserPlus, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import polygonLogo from "@/assets/polygon-logo.svg";
import DiscReportTemplate from "@/components/DiscReportTemplate";
import type { Json } from "@/integrations/supabase/types";



interface TeamMember {
  id: string;
  full_name: string;
  role: "employee" | "leader";
  primary_style: string | null;
  answers: string[] | null;
  completed_at: string | null;
}

const LeaderDashboard = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t, lang, setLang } = useTranslation();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [pendingUsers, setPendingUsers] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [reportData, setReportData] = useState<{
    fullName: string;
    primaryStyle: string;
    scores: { D: number; I: number; S: number; C: number };
  } | null>(null);
  const [preApproveNames, setPreApproveNames] = useState("");
  const [preApproveLoading, setPreApproveLoading] = useState(false);
  const [preApproveOpen, setPreApproveOpen] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (user.status !== "approved" || user.role !== "leader") {
      toast({ title: t.common.accessDenied, description: t.common.leaderOnly });
      navigate("/disc-test");
      return;
    }
    fetchTeam();
    fetchPending();
  }, [user, navigate]);

  const fetchPending = async () => {
    const { data } = await supabase.from("profiles").select("id, full_name, status").eq("status", "pending_approval");
    setPendingUsers(data ?? []);
  };

  const handleApprove = async (userId: string, name: string) => {
    await supabase.from("profiles").update({ status: "approved" } as any).eq("id", userId);
    toast({ title: t.approval.approved, description: t.approval.approvedMessage.replace("{name}", name) });
    fetchPending();
    fetchTeam();
  };

  const handleReject = async (userId: string, name: string) => {
    // CASCADE handles user_roles and disc_results automatically
    await supabase.from("profiles").delete().eq("id", userId);
    toast({ title: t.approval.rejected, description: t.approval.rejectedMessage.replace("{name}", name) });
    fetchPending();
    fetchTeam();
  };

  const fetchTeam = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, status").eq("status", "approved");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const { data: results } = await supabase.from("disc_results").select("user_id, primary_style, answers, completed_at");

    const rolesMap = new Map(roles?.map((r) => [r.user_id, r.role]));
    const resultsMap = new Map(results?.map((r) => [r.user_id, { primary_style: r.primary_style, answers: r.answers, completed_at: r.completed_at }]));

    const members: TeamMember[] = (profiles ?? []).map((p) => {
      const result = resultsMap.get(p.id);
      return {
        id: p.id,
        full_name: p.full_name,
        role: rolesMap.get(p.id) ?? "employee",
        primary_style: result?.primary_style ?? null,
        answers: parseAnswers(result?.answers ?? null),
        completed_at: result?.completed_at ?? null,
      };
    });

    setTeam(members);
    setLoading(false);
  };

  const parseAnswers = (answers: Json | null): string[] | null => {
    if (!answers || !Array.isArray(answers)) return null;
    return answers.filter((a): a is string => typeof a === "string");
  };

  const calculateScores = (answers: string[]): { D: number; I: number; S: number; C: number } => {
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    answers.forEach((a) => {
      if (a in scores) scores[a as keyof typeof scores]++;
    });
    return scores;
  };

  const totalMembers = team.length;
  const completedCount = team.filter((m) => m.primary_style).length;
  const percentage = totalMembers > 0 ? Math.round((completedCount / totalMembers) * 100) : 0;

  const toggleRole = async (member: TeamMember) => {
    const newRole = member.role === "leader" ? "employee" : "leader";
    await supabase.from("user_roles").update({ role: newRole }).eq("user_id", member.id);
    const roleLabel = newRole === "leader" ? t.common.leader : t.common.employee;
    toast({
      title: t.leader.roleUpdated,
      description: t.leader.roleUpdatedDesc.replace("{name}", member.full_name).replace("{role}", roleLabel),
    });
    if (member.id === user?.id) {
      setUser({ ...user!, role: newRole, status: user!.status ?? "approved" });
      if (newRole === "employee") navigate("/disc-test");
    }
    fetchTeam();
  };

  const handlePreApprove = async () => {
    const names = preApproveNames.split("\n").map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) return;
    setPreApproveLoading(true);
    let added = 0;

    for (const name of names) {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("full_name", name)
        .maybeSingle();

      if (existing) {
        toast({ description: t.leader.preApproveExists.replace("{name}", name) });
        continue;
      }

      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ full_name: name, status: "approved" } as any)
        .select("id")
        .single();

      if (newProfile) {
        await supabase.from("user_roles").insert({ user_id: newProfile.id, role: "employee" });
        added++;
      }
    }

    if (added > 0) {
      toast({ title: t.leader.preApproveAdded.replace("{count}", String(added)) });
    }
    setPreApproveNames("");
    setPreApproveLoading(false);
    fetchTeam();
  };

  const handleDeleteMember = async (member: TeamMember) => {
    if (!confirm(t.leader.deleteConfirm.replace("{name}", member.full_name))) return;
    // CASCADE handles user_roles and disc_results automatically
    await supabase.from("profiles").delete().eq("id", member.id);
    toast({ title: t.leader.deleted.replace("{name}", member.full_name) });
    fetchTeam();
  };

  const downloadReport = async (member: TeamMember) => {
    if (!member.primary_style || !member.answers) return;
    setGeneratingId(member.id);

    const scores = calculateScores(member.answers);
    setReportData({ fullName: member.full_name, primaryStyle: member.primary_style, scores });

    await new Promise((r) => setTimeout(r, 500));

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const el = reportRef.current;
      if (!el) throw new Error("Report element not found");

      const pages = el.children;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = 210;
      const pdfHeight = 297;

      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 794, height: 1123,
        });
        const imgData = canvas.toDataURL("image/png");
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`DiSC-rapport-${member.full_name.replace(/\s+/g, "-")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast({ title: t.common.error, description: t.leader.pdfError, variant: "destructive" });
    } finally {
      setGeneratingId(null);
      setReportData(null);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p>{t.common.loading}</p></div>;

  const NavDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-base sm:text-xl font-semibold text-primary-foreground hover:opacity-80 transition-opacity">
          {t.common.discProfile}
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-popover">
        <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
          {location.pathname === "/dashboard" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/dashboard" ? "ml-6" : ""}>{t.common.navDashboard}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/team-overview")} className="cursor-pointer">
          {location.pathname === "/team-overview" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/team-overview" ? "ml-6" : ""}>{t.teamOverview.title}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/team-analyzer")} className="cursor-pointer">
          {location.pathname === "/team-analyzer" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/team-analyzer" ? "ml-6" : ""}>{t.teamAnalyzer.title}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/disc-test")} className="cursor-pointer">
          {location.pathname === "/disc-test" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/disc-test" ? "ml-6" : ""}>{t.common.navDiscTest}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const LanguageDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{languages.find((l) => l.code === lang)?.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        {languages.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)} className="cursor-pointer">
            {lang === l.code && <Check className="mr-2 h-4 w-4" />}
            <span className={lang !== l.code ? "ml-6" : ""}>{l.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={polygonLogo}
            alt="Polygon"
            className="h-7 sm:h-8 brightness-0 invert cursor-pointer"
            onClick={() => navigate("/disc-test")}
          />
          <NavDropdown />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageDropdown />
          <span className="text-sm opacity-80 hidden sm:inline">{user?.full_name}</span>
          <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary/80 text-sm">
            <LogOut className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t.common.logout}</span>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 mt-4">
        {pendingUsers.length > 0 && (
          <Card className="border-0 shadow-lg rounded-xl border-l-4 border-l-amber-400">
            <CardHeader className="flex flex-row items-center gap-3 pb-2">
              <Users className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">{t.approval.pendingApprovals}</CardTitle>
              <Badge variant="secondary" className="ml-auto">{pendingUsers.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingUsers.map((pu) => (
                <div key={pu.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <span className="font-medium">{pu.full_name}</span>
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-xl" onClick={() => handleApprove(pu.id, pu.full_name)}>
                      {t.approval.approve}
                    </Button>
                    <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => handleReject(pu.id, pu.full_name)}>
                      {t.approval.reject}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Collapsible open={preApproveOpen} onOpenChange={setPreApproveOpen}>
          <Card className="border-0 shadow-lg rounded-xl border-l-4 border-l-blue-400">
            <CollapsibleTrigger asChild>
              <CardHeader className="flex flex-row items-center gap-3 pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-xl">
                <UserPlus className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">{t.leader.preApprove}</CardTitle>
                <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${preApproveOpen ? "rotate-90" : ""}`} />
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{t.leader.preApproveDesc}</p>
                <Textarea
                  value={preApproveNames}
                  onChange={(e) => setPreApproveNames(e.target.value)}
                  placeholder="Anders Jensen&#10;Maria Nielsen&#10;..."
                  rows={4}
                />
                <Button
                  onClick={handlePreApprove}
                  disabled={preApproveLoading || !preApproveNames.trim()}
                  className="rounded-xl"
                >
                  {preApproveLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.leader.preApproveAdd}</>
                  ) : (
                    <><UserPlus className="mr-2 h-4 w-4" /> {t.leader.preApproveAdd}</>
                  )}
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <Card className="border-0 shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t.leader.responseRate}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{t.leader.completedOf.replace("{completed}", String(completedCount)).replace("{total}", String(totalMembers))}</span>
              <span className="font-semibold text-foreground">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">{t.leader.teamOverview}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.leader.name}</TableHead>
                  <TableHead>{t.leader.role}</TableHead>
                  <TableHead>{t.leader.discProfile}</TableHead>
                  <TableHead>{t.leader.status}</TableHead>
                  <TableHead className="text-right">{t.leader.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => {
                  const style = member.primary_style?.split("/")[0];
                  const desc = style ? t.disc.descriptions[style as keyof typeof t.disc.descriptions] : null;
                  const isStale = member.completed_at ? differenceInMonths(new Date(), new Date(member.completed_at)) >= 6 : false;
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.full_name}</TableCell>
                      <TableCell>
                        <Badge variant={member.role === "leader" ? "default" : "secondary"}>
                          {member.role === "leader" ? t.common.leader : t.common.employee}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.primary_style ? (() => {
                          const styleColors: Record<string, string> = {
                            D: "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
                            I: "border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
                            S: "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
                            C: "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
                          };
                          const colorClass = styleColors[style ?? ""] ?? "";
                          return (
                            <Badge variant="outline" className={`font-semibold ${colorClass}`}>
                              {desc?.title ?? member.primary_style}
                            </Badge>
                          );
                        })() : (
                          <span className="text-muted-foreground text-sm">{t.leader.pending}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.primary_style ? (
                          isStale ? (
                            <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                              {t.leader.statusStale}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-green-400 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                              {t.leader.statusCurrent}
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                            {t.leader.statusPreApproved}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-xl h-8 w-8" onClick={() => toggleRole(member)}>
                                  <ShieldCheck className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{member.role === "leader" ? t.leader.makeEmployee : t.leader.makeLeader}</TooltipContent>
                            </Tooltip>
                            {member.primary_style && member.answers && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline" size="icon" className="rounded-xl h-8 w-8"
                                    onClick={() => downloadReport(member)}
                                    disabled={generatingId === member.id}
                                  >
                                    {generatingId === member.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Download className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{generatingId === member.id ? t.leader.generating : t.leader.fullReport}</TooltipContent>
                              </Tooltip>
                            )}
                            {member.id !== user?.id && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline" size="icon" className="rounded-xl h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteMember(member)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t.common.deleteLabel}</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {reportData && (
        <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
          <DiscReportTemplate ref={reportRef} {...reportData} />
        </div>
      )}
    </div>
  );
};

export default LeaderDashboard;
