"use client";

import { PickingBoard } from "@/components/picking-board";

export default function TransfersPage() {
  return (
    <PickingBoard
      kind="internal"
      title="Transfers"
      heading="Internal Transfers"
      description="Move stock between locations and warehouses (replenishment, quality control)."
      partnerLabel="Route"
      validateLabel="Apply"
    />
  );
}
  