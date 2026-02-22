import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useTranslation, languages } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { LogOut, ChevronDown, Check, Globe, Users, Lightbulb, AlertTriangle, MessageCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import polygonLogo from "@/assets/polygon-logo.svg";

interface Employee {
  id: string;
  full_name: string;
  primary_style: string;
}

const DISC_COLORS: Record<string, string> = {
  D: "bg-red-500",
  I: "bg-yellow-500",
  S: "bg-green-500",
  C: "bg-blue-500",
};

const DISC_BADGE_CLASSES: Record<string, string> = {
  D: "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  I: "border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
  S: "border-green-400 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
  C: "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
};

const TeamAnalyzer = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t, lang, setLang } = useTranslation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<{
    counts: Record<string, number>;
    strengths: string[];
    gaps: string[];
    communicationLead: { name: string; style: string } | null;
    planningLead: { name: string; style: string } | null;
  } | null>(null);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (user.role !== "leader") {
      toast({ title: t.common.accessDenied, description: t.common.leaderOnly });
      navigate("/disc-test");
      return;
    }
    fetchEmployees();
  }, [user, navigate]);

  const fetchEmployees = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name");
    const { data: results } = await supabase.from("disc_results").select("user_id, primary_style");
    const resultsMap = new Map(results?.map((r) => [r.user_id, r.primary_style]));
    const completed: Employee[] = (profiles ?? [])
      .filter((p) => resultsMap.has(p.id))
      .map((p) => ({ id: p.id, full_name: p.full_name, primary_style: resultsMap.get(p.id)! }));
    setEmployees(completed);
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); }
      else if (next.size < 5) { next.add(id); }
      return next;
    });
    setAnalysis(null);
  };

  const runAnalysis = () => {
    const selectedEmployees = employees.filter((e) => selected.has(e.id));
    const counts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };
    selectedEmployees.forEach((e) => {
      const style = e.primary_style.split("/")[0];
      if (style in counts) counts[style]++;
    });

    const ta = t.teamAnalyzer;
    const strengths: string[] = [];
    const gaps: string[] = [];

    if (counts.D >= 2) strengths.push(ta.strongD);
    if (counts.I >= 2) strengths.push(ta.strongI);
    if (counts.S >= 2) strengths.push(ta.strongS);
    if (counts.C >= 2) strengths.push(ta.strongC);

    if (counts.D === 0) gaps.push(ta.gapD);
    if (counts.I === 0) gaps.push(ta.gapI);
    if (counts.S === 0) gaps.push(ta.gapS);
    if (counts.C === 0) gaps.push(ta.gapC);

    // Communication lead: first I-type, fallback D-type
    const commLead = selectedEmployees.find((e) => e.primary_style.split("/")[0] === "I")
      ?? selectedEmployees.find((e) => e.primary_style.split("/")[0] === "D")
      ?? null;

    // Planning lead: first C-type, fallback S-type
    const planLead = selectedEmployees.find((e) => e.primary_style.split("/")[0] === "C")
      ?? selectedEmployees.find((e) => e.primary_style.split("/")[0] === "S")
      ?? null;

    setAnalysis({
      counts,
      strengths,
      gaps,
      communicationLead: commLead ? { name: commLead.full_name, style: commLead.primary_style.split("/")[0] } : null,
      planningLead: planLead ? { name: planLead.full_name, style: planLead.primary_style.split("/")[0] } : null,
    });
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const NavDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 text-base sm:text-xl font-semibold text-primary-foreground hover:opacity-80 transition-opacity">
          {t.common.discProfile}
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-popover">
        <DropdownMenuItem onClick={() => navigate("/disc-test")} className="cursor-pointer">
          {location.pathname === "/disc-test" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/disc-test" ? "ml-6" : ""}>{t.common.employee}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer">
          {location.pathname === "/dashboard" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/dashboard" ? "ml-6" : ""}>{t.common.leader}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/team-overview")} className="cursor-pointer">
          {location.pathname === "/team-overview" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/team-overview" ? "ml-6" : ""}>{t.teamOverview.title}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/team-analyzer")} className="cursor-pointer">
          {location.pathname === "/team-analyzer" && <Check className="mr-2 h-4 w-4" />}
          <span className={location.pathname !== "/team-analyzer" ? "ml-6" : ""}>{t.teamAnalyzer.title}</span>
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

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p>{t.common.loading}</p></div>;

  const total = selected.size;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={polygonLogo} alt="Polygon" className="h-7 sm:h-8 brightness-0 invert cursor-pointer" onClick={() => navigate("/disc-test")} />
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

      <main className="max-w-5xl mx-auto p-4 sm:p-6 mt-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">{t.teamAnalyzer.title}</h1>
          <p className="text-muted-foreground">{t.teamAnalyzer.subtitle}</p>
        </div>

        {employees.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">{t.teamAnalyzer.noCompleted}</p>
        ) : (
          <>
            {/* Employee selection */}
            <Card className="border-0 shadow-lg rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {t.teamAnalyzer.selectEmployees}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {t.teamAnalyzer.selected.replace("{count}", String(total))}
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                {employees.map((emp) => {
                  const style = emp.primary_style.split("/")[0];
                  const desc = t.disc.descriptions[style as keyof typeof t.disc.descriptions];
                  return (
                    <label
                      key={emp.id}
                      className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Checkbox
                        checked={selected.has(emp.id)}
                        onCheckedChange={() => toggleSelect(emp.id)}
                        disabled={!selected.has(emp.id) && selected.size >= 5}
                      />
                      <span className="flex-1 font-medium">{emp.full_name}</span>
                      <Badge variant="outline" className={DISC_BADGE_CLASSES[style] ?? ""}>
                        {desc?.title ?? emp.primary_style}
                      </Badge>
                    </label>
                  );
                })}
                <div className="pt-4 flex items-center gap-3">
                  <Button
                    onClick={runAnalysis}
                    disabled={total < 2}
                    className="rounded-xl"
                  >
                    {t.teamAnalyzer.analyze}
                  </Button>
                  {total < 2 && (
                    <span className="text-sm text-muted-foreground">{t.teamAnalyzer.minSelect}</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analysis results */}
            {analysis && (
              <div className="space-y-6">
                {/* DISC balance */}
                <Card className="border-0 shadow-lg rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-lg">{t.teamAnalyzer.balance}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(["D", "I", "S", "C"] as const).map((type) => {
                      const count = analysis.counts[type];
                      const maxCount = Math.max(...Object.values(analysis.counts), 1);
                      const pct = (count / maxCount) * 100;
                      const desc = t.disc.descriptions[type as keyof typeof t.disc.descriptions];
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <Badge variant="outline" className={`w-28 justify-center ${DISC_BADGE_CLASSES[type]}`}>
                            {desc?.title?.split(" ")[0] ?? type}
                          </Badge>
                          <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${DISC_COLORS[type]} rounded-full transition-all duration-500`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Strengths */}
                {analysis.strengths.length > 0 && (
                  <Card className="border-0 shadow-lg rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-green-600" />
                        {t.teamAnalyzer.strengths}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Gaps */}
                {analysis.gaps.length > 0 && (
                  <Card className="border-0 shadow-lg rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        {t.teamAnalyzer.gaps}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.gaps.map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {(analysis.communicationLead || analysis.planningLead) && (
                  <Card className="border-0 shadow-lg rounded-xl">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" />
                        {t.teamAnalyzer.recommendations}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysis.communicationLead && (
                        <div className="flex items-start gap-3 p-3 rounded-xl border bg-muted/50">
                          <Badge variant="outline" className={DISC_BADGE_CLASSES[analysis.communicationLead.style]}>
                            {analysis.communicationLead.style}
                          </Badge>
                          <div>
                            <p className="font-semibold text-sm">{analysis.communicationLead.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {t.teamAnalyzer.communicationLead} – {t.teamAnalyzer.becauseCommunication}
                            </p>
                          </div>
                        </div>
                      )}
                      {analysis.planningLead && (
                        <div className="flex items-start gap-3 p-3 rounded-xl border bg-muted/50">
                          <Badge variant="outline" className={DISC_BADGE_CLASSES[analysis.planningLead.style]}>
                            {analysis.planningLead.style}
                          </Badge>
                          <div>
                            <p className="font-semibold text-sm">{analysis.planningLead.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {t.teamAnalyzer.planningLead} – {t.teamAnalyzer.becausePlanning}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TeamAnalyzer;
