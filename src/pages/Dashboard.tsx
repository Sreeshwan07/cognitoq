import {
  Database,
  FileText,
  Zap,
  BarChart3,
  Upload,
  BookOpen,
  TrendingUp,
  Clock,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { subjects, branches } from "@/data/subjects";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const recentPapers = [
  { name: "Data Structures & Algorithms (CS201)", date: "Feb 20, 2026", questions: 25, marks: 100 },
  { name: "Engineering Mathematics I (MA101)", date: "Feb 18, 2026", questions: 20, marks: 70 },
  { name: "Operating Systems (CS301)", date: "Feb 15, 2026", questions: 22, marks: 100 },
  { name: "DBMS (CS302)", date: "Feb 12, 2026", questions: 18, marks: 70 },
];

const quickActions = [
  { label: "Browse Subjects", icon: GraduationCap, to: "/subjects", color: "bg-primary/10 text-primary" },
  { label: "Upload Questions", icon: Upload, to: "/question-bank", color: "bg-info/10 text-info" },
  { label: "Generate Paper", icon: Zap, to: "/generate", color: "bg-accent/10 text-accent" },
  { label: "View Analytics", icon: BarChart3, to: "/analytics", color: "bg-success/10 text-success" },
];

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-display text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">B.Tech Question Paper Generator — {subjects.length} subjects across {branches.length} branches.</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <StatCard
            title="Total Questions"
            value="2,847"
            icon={<Database className="w-5 h-5" />}
            trend={{ value: "12% this month", positive: true }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Papers Generated"
            value="156"
            icon={<FileText className="w-5 h-5" />}
            trend={{ value: "8 this week", positive: true }}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Avg. Gen Time"
            value="1.8s"
            icon={<Clock className="w-5 h-5" />}
            subtitle="Ultra fast"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Syllabus Coverage"
            value="94%"
            icon={<TrendingUp className="w-5 h-5" />}
            trend={{ value: "3% improvement", positive: true }}
          />
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {quickActions.map((action) => (
          <Link key={action.label} to={action.to}>
            <div className="elevated-card rounded-xl p-4 hover:shadow-lg transition-all duration-200 group cursor-pointer">
              <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                <action.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                {action.label}
              </p>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Recent Papers */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="elevated-card rounded-xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-display text-foreground">Recent Papers</h2>
          <Link to="/papers">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View all
            </Button>
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentPapers.map((paper, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-primary/5 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{paper.name}</p>
                  <p className="text-xs text-muted-foreground">{paper.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>{paper.questions} Qs</span>
                <span>{paper.marks} marks</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
