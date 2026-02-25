import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";
import StatCard from "@/components/StatCard";
import { TrendingUp, Target, AlertTriangle, Activity, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subjects, branches } from "@/data/subjects";
import { pyqPapers, getPYQAnalytics } from "@/data/pyqData";

const topicCoverage = [
  { topic: "DSA", coverage: 92 },
  { topic: "DBMS", coverage: 85 },
  { topic: "OS", coverage: 78 },
  { topic: "CN", coverage: 72 },
  { topic: "ML", coverage: 58 },
];

const difficultyData = [
  { name: "Easy", value: 35, color: "hsl(var(--success))" },
  { name: "Medium", value: 42, color: "hsl(var(--warning))" },
  { name: "Hard", value: 23, color: "hsl(var(--destructive))" },
];

const usageTrend = [
  { month: "Sep", papers: 12 },
  { month: "Oct", papers: 18 },
  { month: "Nov", papers: 24 },
  { month: "Dec", papers: 15 },
  { month: "Jan", papers: 32 },
  { month: "Feb", papers: 28 },
];

const frequentQuestions = [
  { text: "Explain normalization up to BCNF", count: 12 },
  { text: "Compare BFS and DFS with examples", count: 9 },
  { text: "Explain TCP three-way handshake", count: 8 },
  { text: "Implement Banker's algorithm", count: 7 },
  { text: "Explain backpropagation in neural networks", count: 6 },
];

export default function Analytics() {
  const [selectedSubject, setSelectedSubject] = useState("CS302");
  const analytics = getPYQAnalytics(selectedSubject);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Question bank insights, PYQ trends, and generation analytics.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg. Coverage" value="73%" icon={<Target className="w-5 h-5" />} trend={{ value: "5% up", positive: true }} />
        <StatCard title="Weak Areas" value="2" icon={<AlertTriangle className="w-5 h-5" />} subtitle="Need attention" />
        <StatCard title="This Month" value="28" icon={<Activity className="w-5 h-5" />} subtitle="Papers generated" />
        <StatCard title="Unique Qs Used" value="1,204" icon={<TrendingUp className="w-5 h-5" />} trend={{ value: "18% of bank", positive: true }} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Topic Coverage */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="elevated-card rounded-xl p-5">
          <h3 className="font-display text-lg text-foreground mb-4">Subject Coverage</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topicCoverage} barSize={28}>
              <XAxis dataKey="topic" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="coverage" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Difficulty Distribution */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="elevated-card rounded-xl p-5">
          <h3 className="font-display text-lg text-foreground mb-4">Difficulty Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={difficultyData} cx="50%" cy="50%" outerRadius={80} innerRadius={50} dataKey="value" stroke="none">
                  {difficultyData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {difficultyData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value}%)
              </div>
            ))}
          </div>
        </motion.div>

        {/* Usage Trend */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="elevated-card rounded-xl p-5">
          <h3 className="font-display text-lg text-foreground mb-4">Generation Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={usageTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="papers" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Most Used Questions */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="elevated-card rounded-xl p-5">
          <h3 className="font-display text-lg text-foreground mb-4">Most Used Questions</h3>
          <div className="space-y-3">
            {frequentQuestions.map((q, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}.</span>
                <div className="flex-1">
                  <p className="text-sm text-foreground truncate">{q.text}</p>
                </div>
                <span className="text-xs font-medium text-accent">{q.count}×</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* PYQ Analytics Section */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="elevated-card rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> PYQ Trend Analysis
          </h3>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[...new Set(pyqPapers.map(p => p.subjectCode))].map(code => {
                const paper = pyqPapers.find(p => p.subjectCode === code);
                return (
                  <SelectItem key={code} value={code}>{code} — {paper?.subject}</SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Unit Weightage (Avg. across PYQs)</p>
            {Object.entries(analytics.unitWeightage).map(([unit, weight]) => (
              <div key={unit} className="flex items-center gap-2">
                <span className="text-xs text-foreground truncate flex-1">{unit}</span>
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${weight}%` }} />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{weight}%</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Frequently Asked Questions</p>
            {analytics.frequentQuestions.slice(0, 6).map((q, i) => (
              <p key={i} className="text-xs text-foreground/80 truncate">
                <span className="text-accent font-mono mr-1">{q.count}×</span> {q.text}
              </p>
            ))}
            <p className="text-[10px] text-muted-foreground mt-2">Difficulty trend: {analytics.difficultyTrend}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
