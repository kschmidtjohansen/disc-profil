import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { discDescriptions } from "@/lib/disc-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Download, ShieldCheck, Users } from "lucide-react";
import polygonLogo from "@/assets/polygon-logo.svg";

const TOTAL_EMPLOYEES = 16;

interface TeamMember {
  id: string;
  full_name: string;
  role: "employee" | "leader";
  primary_style: string | null;
}

const LeaderDashboard = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (user.role !== "leader") { navigate("/employee"); return; }
    fetchTeam();
  }, [user, navigate]);

  const fetchTeam = async () => {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const { data: results } = await supabase.from("disc_results").select("user_id, primary_style");

    const rolesMap = new Map(roles?.map((r) => [r.user_id, r.role]));
    const resultsMap = new Map(results?.map((r) => [r.user_id, r.primary_style]));

    const members: TeamMember[] = (profiles ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      role: rolesMap.get(p.id) ?? "employee",
      primary_style: resultsMap.get(p.id) ?? null,
    }));

    setTeam(members);
    setLoading(false);
  };

  const completedCount = team.filter((m) => m.primary_style).length;
  const percentage = Math.round((completedCount / TOTAL_EMPLOYEES) * 100);

  const toggleRole = async (member: TeamMember) => {
    const newRole = member.role === "leader" ? "employee" : "leader";
    await supabase.from("user_roles").update({ role: newRole }).eq("user_id", member.id);
    toast({ title: "Rolle opdateret", description: `${member.full_name} er nu ${newRole === "leader" ? "Leder" : "Medarbejder"}.` });
    if (member.id === user?.id) {
      setUser({ ...user!, role: newRole });
      if (newRole === "employee") navigate("/employee");
    }
    fetchTeam();
  };

  const downloadReport = (member: TeamMember) => {
    if (!member.primary_style) return;
    const desc = discDescriptions[member.primary_style];
    const content = `
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <title>DiSC Rapport – ${member.full_name}</title>
  <style>
    body { font-family: 'Inter', 'Segoe UI', sans-serif; max-width: 700px; margin: 40px auto; color: #333; padding: 20px; }
    h1 { color: #00aeef; border-bottom: 3px solid #00aeef; padding-bottom: 12px; }
    h2 { color: #00aeef; margin-top: 30px; }
    .badge { display: inline-block; background: #00aeef; color: white; padding: 4px 16px; border-radius: 20px; font-size: 14px; margin-right: 8px; margin-bottom: 8px; }
    .style-circle { display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; border-radius: 50%; background: #00aeef; color: white; font-size: 36px; font-weight: bold; margin: 20px 0; }
    p { line-height: 1.7; }
    .section { background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .section-title { font-weight: 600; color: #00aeef; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>DiSC Profilrapport</h1>
  <p><strong>Navn:</strong> ${member.full_name}</p>
  <p><strong>Dato:</strong> ${new Date().toLocaleDateString("da-DK")}</p>
  <div class="style-circle">${member.primary_style}</div>
  <h2>${desc.title}</h2>

  <div class="section">
    <div class="section-title">Generel Profil</div>
    <p>${desc.generalProfile}</p>
  </div>

  <div class="section">
    <div class="section-title">Styrker</div>
    <p>${desc.strengths}</p>
  </div>

  <div class="section">
    <div class="section-title">Udviklingsområde</div>
    <p>${desc.developmentArea}</p>
  </div>

  <div class="section">
    <div class="section-title">I Teamet</div>
    <p>${desc.teamRole}</p>
  </div>

  <h2>Nøgleegenskaber</h2>
  <div>${desc.traits.map((t) => `<span class="badge">${t}</span>`).join("")}</div>
  <div class="footer">Genereret af DiSC Profilerings-app – Polygon Group</div>
</body>
</html>`;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DiSC-rapport-${member.full_name.replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => { logout(); navigate("/"); };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p>Indlæser...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={polygonLogo} alt="Polygon" className="h-8 brightness-0 invert" />
          <span className="text-xl font-semibold">DiSC Profilering – Leder</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-80">{user?.full_name}</span>
          <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary/80">
            <LogOut className="mr-2 h-4 w-4" /> Log ud
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8 mt-4">
        <Card className="border-0 shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Svarprocent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{completedCount} af {TOTAL_EMPLOYEES} har gennemført</span>
              <span className="font-semibold text-foreground">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg">Teamoversigt</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>DiSC Profil</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === "leader" ? "default" : "secondary"}>
                        {member.role === "leader" ? "Leder" : "Medarbejder"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.primary_style ? (
                        <Badge variant="outline" className="font-semibold">
                          {discDescriptions[member.primary_style]?.title ?? member.primary_style}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Afventer</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => toggleRole(member)}
                      >
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        {member.role === "leader" ? "Gør til medarbejder" : "Gør til leder"}
                      </Button>
                      {member.primary_style && (
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => downloadReport(member)}>
                          <Download className="mr-1 h-3 w-3" /> Rapport
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LeaderDashboard;
