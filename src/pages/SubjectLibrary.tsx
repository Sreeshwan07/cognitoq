import { useState } from "react";
import { BookOpen, Search, GraduationCap, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { subjects, branches, type Subject } from "@/data/subjects";
import { Link } from "react-router-dom";

const yearLabels: Record<number, string> = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };

export default function SubjectLibrary() {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const filtered = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    const matchesBranch = branchFilter === "all" || s.branch === branchFilter;
    const matchesYear = yearFilter === "all" || s.year === Number(yearFilter);
    return matchesSearch && matchesBranch && matchesYear;
  });

  // Group by year then branch
  const grouped = filtered.reduce<Record<number, Subject[]>>((acc, s) => {
    (acc[s.year] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Subject Library</h1>
        <p className="text-muted-foreground mt-1">
          Pre-loaded B.Tech subjects across all branches and years.
        </p>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {branches.filter((b) => b.id !== "core").map((b) => (
          <div
            key={b.id}
            onClick={() => setBranchFilter(branchFilter === b.id ? "all" : b.id)}
            className={cn(
              "elevated-card rounded-xl p-4 cursor-pointer transition-all",
              branchFilter === b.id && "ring-2 ring-accent accent-glow"
            )}
          >
            <p className="text-xs text-muted-foreground">{b.shortName}</p>
            <p className="text-lg font-bold font-display text-foreground">
              {subjects.filter((s) => s.branch === b.id).length}
            </p>
            <p className="text-xs text-muted-foreground truncate">{b.name}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search subjects or codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={branchFilter} onValueChange={setBranchFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.shortName} — {b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="1">1st Year</SelectItem>
            <SelectItem value="2">2nd Year</SelectItem>
            <SelectItem value="3">3rd Year</SelectItem>
            <SelectItem value="4">4th Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grouped List */}
      {Object.keys(grouped)
        .sort((a, b) => Number(a) - Number(b))
        .map((year) => (
          <motion.div
            key={year}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 pt-2">
              <GraduationCap className="w-4 h-4 text-accent" />
              <h2 className="font-display text-lg text-foreground">{yearLabels[Number(year)]}</h2>
              <Badge variant="secondary" className="text-xs">{grouped[Number(year)].length} subjects</Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {grouped[Number(year)].map((sub, i) => {
                const branch = branches.find((b) => b.id === sub.branch);
                return (
                  <Link key={sub.id} to={`/generate?subject=${sub.id}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="elevated-card rounded-lg p-4 hover:shadow-md transition-all group cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-accent">{sub.code}</span>
                            <Badge variant="outline" className="text-[10px]">
                              {branch?.shortName}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground truncate">{sub.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Sem {sub.semester} • {sub.units.length} units
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors mt-1" />
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ))}

      <p className="text-xs text-muted-foreground text-center pt-2">
        Showing {filtered.length} of {subjects.length} subjects
      </p>
    </div>
  );
}
