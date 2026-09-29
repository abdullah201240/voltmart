"use client";

import { PickingBoard } from "@/components/picking-board";

export default function DeliveriesPage() {
  return (
    <PickingBoard
      kind="outgoing"
      title="Deliveries"
      heading="Delivery Orders"
      description="Outgoing shipments from sales orders — pick, pack and ship to the courier."
      partnerLabel="Customer"
      validateLabel="Validate"
    />
  );
}
