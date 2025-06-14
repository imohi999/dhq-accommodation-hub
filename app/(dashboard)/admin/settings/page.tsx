'use client';

import { StampSettingsView } from "@/components/allocation/StampSettingsView";

export default function StampSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B365D]">Stamp Settings</h1>
        <p className="text-muted-foreground">
          Configure allocation letter stamp settings
        </p>
      </div>
      <StampSettingsView />
    </div>
  );
}