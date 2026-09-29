import { SfIconCheck, SfIconPackage, SfIconLocalShipping, SfIconWarehouse, SfIconShoppingCart, SfIconHome } from "@storefront-ui/react";
import { classNames } from "@/lib/format";
import type { Order } from "@/lib/data";

const STAGES = [
  { label: "Order Placed", icon: <SfIconShoppingCart size="sm" /> },
  { label: "Confirmed", icon: <SfIconCheck size="sm" /> },
  { label: "Packed", icon: <SfIconWarehouse size="sm" /> },
  { label: "Shipped", icon: <SfIconPackage size="sm" /> },
  { label: "Out for Delivery", icon: <SfIconLocalShipping size="sm" /> },
  { label: "Delivered", icon: <SfIconHome size="sm" /> },
];

const STAGE_BY_STATUS: Record<Order["status"], number> = {
  processing: 1,
  confirmed: 2,
  shipped: 4,
  delivered: 6,
};

export function statusLabel(status: Order["status"]) {
  return { processing: "Processing", confirmed: "Confirmed", shipped: "Shipped", delivered: "Delivered" }[status];
}

export function StatusBadge({ status }: { status: Order["status"] }) {
  const tone = status === "delivered" ? "bg-positive-100 text-positive-800" : status === "shipped" ? "bg-primary-100 text-primary-800" : "bg-warning-100 text-warning-800";
  return <span className={classNames("rounded-xs px-2 py-0.5 text-[11px] font-semibold", tone)}>{statusLabel(status)}</span>;
}

export function OrderTimeline({ status }: { status: Order["status"] }) {
  const done = STAGE_BY_STATUS[status];
  return (
    <ol className="relative flex flex-col">
      {STAGES.map((s, i) => {
        const complete = i < done;
        const current = i === done - 1 || (status === "processing" && i === 1);
        return (
          <li key={s.label} className="flex gap-2.5">
            <div className="flex flex-col items-center">
              <span
                className={classNames(
                  "flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-white [&>svg]:h-3.5 [&>svg]:w-3.5",
                  complete ? "bg-positive-600 text-white" : current ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-400",
                )}
              >
                {complete ? <SfIconCheck size="xs" /> : s.icon}
              </span>
              {i < STAGES.length - 1 && <span className={classNames("h-6 w-0.5", complete ? "bg-positive-500" : "bg-neutral-200")} />}
            </div>
            <div className="pb-4">
              <p className={classNames("text-xs sm:text-sm font-semibold", complete || current ? "text-neutral-900" : "text-neutral-400")}>{s.label}</p>
              <p className="text-[11px] text-neutral-500">{complete ? "Completed" : current ? "In progress" : "Pending"}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
