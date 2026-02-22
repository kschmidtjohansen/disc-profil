import { forwardRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer } from "recharts";
import { discDescriptions } from "@/lib/disc-data";
import { discReportData } from "@/lib/disc-report-data";
import polygonLogo from "@/assets/polygon-logo.svg";

interface DiscReportTemplateProps {
  fullName: string;
  primaryStyle: string;
  scores: { D: number; I: number; S: number; C: number };
}

const COLORS: Record<string, string> = {
  D: "#e74c3c",
  I: "#f1c40f",
  S: "#2ecc71",
  C: "#00aeef",
};

const DiscReportTemplate = forwardRef<HTMLDivElement, DiscReportTemplateProps>(
  ({ fullName, primaryStyle, scores }, ref) => {
    const style = primaryStyle.split("/")[0]; // take first if tie
    const desc = discDescriptions[style];
    const report = discReportData[style];
    const chartData = [
      { name: "D", score: scores.D, label: "Dominans" },
      { name: "I", score: scores.I, label: "Indflydelse" },
      { name: "S", score: scores.S, label: "Stabilitet" },
      { name: "C", score: scores.C, label: "Samvittighed" },
    ];
    const date = new Date().toLocaleDateString("da-DK", { day: "numeric", month: "long", year: "numeric" });

    return (
      <div ref={ref} style={{ width: 794, fontFamily: "'Inter', sans-serif", color: "#2d3748", background: "#fff" }}>
        {/* PAGE 1 */}
        <div style={{ width: 794, minHeight: 1123, padding: "48px 56px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "3px solid #00aeef", paddingBottom: 16 }}>
            <img src={polygonLogo} alt="Polygon" style={{ height: 36 }} />
            <div style={{ textAlign: "right", fontSize: 13, color: "#718096" }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#2d3748" }}>{fullName}</div>
              <div>{date}</div>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#00aeef", margin: "24px 0 8px" }}>DISC Profilrapport</h1>
          <p style={{ fontSize: 14, color: "#718096", marginBottom: 32 }}>Personlig adfærdsprofil baseret på DISC-modellen</p>

          {/* Chart */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#2d3748", marginBottom: 12 }}>Pointfordeling</h2>
            <div style={{ width: 680, height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#4a5568" }} />
                  <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: "#4a5568" }} />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={60}>
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Primary Profile */}
          <div style={{ background: "#f7fafc", borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: COLORS[style], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 700 }}>
                {style}
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#2d3748", margin: 0 }}>Din Primære Profil</h2>
                <p style={{ fontSize: 15, color: "#00aeef", fontWeight: 600, margin: 0 }}>{desc.title}</p>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#4a5568" }}>{desc.generalProfile}</p>
          </div>

          {/* Strengths & Development */}
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ flex: 1, background: "#f0fff4", borderRadius: 12, padding: "20px 24px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#2ecc71", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Styrker</h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#4a5568" }}>{desc.strengths}</p>
            </div>
            <div style={{ flex: 1, background: "#fff5f5", borderRadius: 12, padding: "20px 24px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e74c3c", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Udviklingsområde</h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: "#4a5568" }}>{desc.developmentArea}</p>
            </div>
          </div>
        </div>

        {/* PAGE 2 */}
        <div style={{ width: 794, minHeight: 1123, padding: "48px 56px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, borderBottom: "2px solid #e2e8f0", paddingBottom: 12 }}>
            <img src={polygonLogo} alt="Polygon" style={{ height: 28 }} />
            <span style={{ fontSize: 12, color: "#a0aec0" }}>Adfærdsindsigter – {fullName}</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#00aeef", marginBottom: 28 }}>Adfærdsindsigter</h2>

          {[
            { title: "Motivation", icon: "🎯", text: report.motivation, bg: "#ebf8ff" },
            { title: "Under pres", icon: "⚡", text: report.underPressure, bg: "#fff5f5" },
            { title: "Kommunikation", icon: "💬", text: report.communication, bg: "#f0fff4" },
          ].map((section) => (
            <div key={section.title} style={{ background: section.bg, borderRadius: 12, padding: "24px 28px", marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#2d3748", marginBottom: 8 }}>
                {section.icon} {section.title}
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.8, color: "#4a5568", margin: 0 }}>{section.text}</p>
            </div>
          ))}
        </div>

        {/* PAGE 3 */}
        <div style={{ width: 794, minHeight: 1123, padding: "48px 56px", boxSizing: "border-box" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, borderBottom: "2px solid #e2e8f0", paddingBottom: 12 }}>
            <img src={polygonLogo} alt="Polygon" style={{ height: 28 }} />
            <span style={{ fontSize: 12, color: "#a0aec0" }}>Lederguide – {fullName}</span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#00aeef", marginBottom: 28 }}>Gode råd til lederen</h2>

          <div style={{ background: "#ebf8ff", borderRadius: 12, padding: "24px 28px", marginBottom: 28 }}>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {report.leaderTips.map((tip, i) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 2, color: "#2d3748" }}>{tip}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: "#f7fafc", borderRadius: 12, padding: "24px 28px", marginBottom: 28 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#2d3748", marginBottom: 8 }}>I Teamet</h3>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#4a5568", margin: 0 }}>{desc.teamRole}</p>
          </div>

          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#2d3748", marginBottom: 12 }}>Nøgleegenskaber</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {desc.traits.map((t) => (
                <span key={t} style={{ background: "#00aeef", color: "#fff", padding: "6px 18px", borderRadius: 20, fontSize: 13, fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 80, borderTop: "1px solid #e2e8f0", paddingTop: 16, fontSize: 11, color: "#a0aec0", textAlign: "center" }}>
            Genereret af DISC Profil – Polygon Group – {date}
          </div>
        </div>
      </div>
    );
  }
);

DiscReportTemplate.displayName = "DiscReportTemplate";
export default DiscReportTemplate;
