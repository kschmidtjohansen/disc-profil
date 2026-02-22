import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { discQuestions, discDescriptions, calculatePrimaryStyle } from "@/lib/disc-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LogOut, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import polygonLogo from "@/assets/polygon-logo.svg";

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [discResult, setDiscResult] = useState<string | null>(null);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    if (user.role === "leader") { navigate("/leader"); return; }

    supabase
      .from("disc_results")
      .select("primary_style")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setDiscResult(data.primary_style);
        setLoading(false);
      });
  }, [user, navigate]);

  const handleAnswer = (style: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = style;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!user) return;
    const primaryStyle = calculatePrimaryStyle(answers);
    await supabase.from("disc_results").insert({
      user_id: user.id,
      answers: answers as unknown as any,
      primary_style: primaryStyle,
    });
    setDiscResult(primaryStyle);
    setTestStarted(false);
  };

  const handleLogout = () => { logout(); navigate("/"); };

  if (loading) return <div className="flex min-h-screen items-center justify-center"><p>Indlæser...</p></div>;

  // Test view
  if (testStarted && !discResult) {
    const q = discQuestions[currentQuestion];
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={polygonLogo} alt="Polygon" className="h-8 brightness-0 invert" />
            <span className="text-xl font-semibold">DiSC Profilering</span>
          </div>
          <span className="text-sm opacity-80">Spørgsmål {currentQuestion + 1} af {discQuestions.length}</span>
        </header>
        <main className="max-w-2xl mx-auto p-6 mt-8">
          <Card className="rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">{q.question}</CardTitle>
              <CardDescription>Vælg det svar, der passer dig bedst</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={answers[currentQuestion] || ""} onValueChange={handleAnswer}>
                {q.options.map((opt) => (
                  <div key={opt.style} className="flex items-center space-x-3 p-3 rounded-xl border hover:bg-muted transition-colors cursor-pointer">
                    <RadioGroupItem value={opt.style} id={`q${q.id}-${opt.style}`} />
                    <Label htmlFor={`q${q.id}-${opt.style}`} className="cursor-pointer flex-1 text-base">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion((p) => p - 1)}
                  disabled={currentQuestion === 0}
                  className="rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Tilbage
                </Button>
                {currentQuestion < discQuestions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestion((p) => p + 1)}
                    disabled={!answers[currentQuestion]}
                    className="rounded-xl"
                  >
                    Næste <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={answers.length < discQuestions.length || answers.some((a) => !a)}
                    className="rounded-xl"
                  >
                    Indsend svar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Result view
  if (discResult) {
    const desc = discDescriptions[discResult];
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={polygonLogo} alt="Polygon" className="h-8 brightness-0 invert" />
            <span className="text-xl font-semibold">DiSC Profilering</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary/80">
            <LogOut className="mr-2 h-4 w-4" /> Log ud
          </Button>
        </header>
        <main className="max-w-2xl mx-auto p-6 mt-8">
          <Card className="border-0 shadow-lg rounded-xl">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-3xl font-bold">{discResult}</span>
              </div>
              <CardTitle className="text-2xl">{desc.title}</CardTitle>
              <Badge variant="secondary" className="mx-auto">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Profil gennemført
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">{desc.description}</p>
              <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Dine nøgleegenskaber</h3>
                <div className="flex flex-wrap gap-2">
                  {desc.traits.map((t) => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Welcome view
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={polygonLogo} alt="Polygon" className="h-8 brightness-0 invert" />
          <span className="text-xl font-semibold">DiSC Profilering</span>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary/80">
          <LogOut className="mr-2 h-4 w-4" /> Log ud
        </Button>
      </header>
      <main className="max-w-2xl mx-auto p-6 mt-16">
        <Card className="text-center border-0 shadow-lg rounded-xl">
          <CardHeader className="space-y-4 pb-2">
            <CardTitle className="text-3xl">Velkommen, {user?.full_name}!</CardTitle>
            <CardDescription className="text-base">
              Du har endnu ikke udfyldt din DiSC-profil. Klik nedenfor for at starte.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button size="lg" onClick={() => setTestStarted(true)} className="text-base px-8 rounded-xl">
              Start DiSC Profil <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
