"use client";

import SecurityMonitor from "@/components/audit/SecurityMonitor";
import NeuralChat from "@/components/audit/NeuralChat";
import EvidenceVault from "@/components/audit/EvidenceVault";

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-black text-xs font-medium overflow-hidden">
      <SecurityMonitor />
      <NeuralChat />
      <EvidenceVault />
    </div>
  );
}
