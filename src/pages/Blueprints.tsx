import { useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface UnitAllocation {
  id: number;
  name: string;
  weightage: number;
  color: string;
}

const colors = [
  "bg-accent", "bg-info", "bg-success", "bg-destructive",
  "bg-primary", "bg-warning",
];

const initialUnits: UnitAllocation[] = [
  { id: 1, name: "Unit 1: Mechanics", weightage: 25, color: colors[0] },
  { id: 2, name: "Unit 2: Thermodynamics", weightage: 20, color: colors[1] },
  { id: 3, name: "Unit 3: Optics", weightage: 20, color: colors[2] },
  { id: 4, name: "Unit 4: Electromagnetism", weightage: 20, color: colors[3] },
  { id: 5, name: "Unit 5: Modern Physics", weightage: 15, color: colors[4] },
];

export default function Blueprints() {
  const [units, setUnits] = useState<UnitAllocation[]>(initialUnits);
  const [blueprintName, setBlueprintName] = useState("Physics Mid-Term Blueprint");

  const total = units.reduce((s, u) => s + u.weightage, 0);

  const updateWeightage = (id: number, val: number) => {
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, weightage: val } : u)));
  };

  const addUnit = () => {
    const id = Date.now();
    setUnits((prev) => [
      ...prev,
      { id, name: `Unit ${prev.length + 1}`, weightage: 10, color: colors[prev.length % colors.length] },
    ]);
  };

  const removeUnit = (id: number) => {
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Blueprint Builder</h1>
        <p className="text-muted-foreground mt-1">Define unit weightage to ensure balanced question papers.</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Unit List */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="elevated-card rounded-xl p-5 space-y-4"
        >
          <div className="space-y-2">
            <Label>Blueprint Name</Label>
            <Input value={blueprintName} onChange={(e) => setBlueprintName(e.target.value)} />
          </div>

          <div className="space-y-3">
            {units.map((unit) => (
              <div key={unit.id} className="flex items-center gap-3">
                <div className={cn("w-3 h-3 rounded-full flex-shrink-0", unit.color)} />
                <Input
                  value={unit.name}
                  onChange={(e) =>
                    setUnits((prev) => prev.map((u) => (u.id === unit.id ? { ...u, name: e.target.value } : u)))
                  }
                  className="flex-1 text-sm"
                />
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={unit.weightage}
                    onChange={(e) => updateWeightage(unit.id, Number(e.target.value))}
                    className="w-16 text-sm text-center"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeUnit(unit.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={addUnit}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Unit
            </Button>
            <span className={cn("text-sm font-medium", total === 100 ? "text-success" : "text-destructive")}>
              Total: {total}%
            </span>
          </div>

          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={total !== 100}>
            <Save className="w-4 h-4 mr-1" /> Save Blueprint
          </Button>
        </motion.div>

        {/* Visual Chart */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="elevated-card rounded-xl p-5 flex flex-col items-center justify-center"
        >
          <h3 className="font-display text-lg text-foreground mb-6">Weightage Distribution</h3>

          {/* Bar chart */}
          <div className="w-full space-y-3">
            {units.map((unit) => (
              <div key={unit.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground font-medium truncate mr-2">{unit.name}</span>
                  <span className="text-muted-foreground">{unit.weightage}%</span>
                </div>
                <div className="h-6 w-full bg-muted rounded-md overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-md", unit.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${unit.weightage}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Stacked bar */}
          <div className="w-full mt-8">
            <p className="text-xs text-muted-foreground mb-2">Combined view</p>
            <div className="h-8 w-full rounded-lg overflow-hidden flex">
              {units.map((unit) => (
                <motion.div
                  key={unit.id}
                  className={cn("h-full", unit.color)}
                  initial={{ width: 0 }}
                  animate={{ width: `${unit.weightage}%` }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  title={`${unit.name}: ${unit.weightage}%`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
