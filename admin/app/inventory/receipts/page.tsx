"use client";

import { PickingBoard } from "@/components/picking-board";

export default function ReceiptsPage() {
  return (
    <PickingBoard
      kind="incoming"
      title="Receipts"
      heading="Receipts"
      description="Incoming goods from purchase orders — receive stock into the warehouse."
      partnerLabel="Vendor"
      validateLabel="Receive"
    />
  );
}
