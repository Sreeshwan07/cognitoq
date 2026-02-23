import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your institution and paper preferences.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="elevated-card rounded-xl p-6 space-y-5">
        <h3 className="font-display text-lg text-foreground">Institution Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Institution Name</Label>
            <Input defaultValue="Springfield Academy" />
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input placeholder="https://..." />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="elevated-card rounded-xl p-6 space-y-5">
        <h3 className="font-display text-lg text-foreground">Paper Defaults</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Default Total Marks</Label>
            <Input type="number" defaultValue="100" />
          </div>
          <div className="space-y-2">
            <Label>Default Duration (minutes)</Label>
            <Input type="number" defaultValue="180" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Include Instructions Section</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-number Questions</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Marks Alignment</Label>
            <Switch defaultChecked />
          </div>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
      </div>
    </div>
  );
}
