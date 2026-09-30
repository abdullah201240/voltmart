"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Building,
  Mail,
  Phone,
  Globe,
  Clock,
  Landmark,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { VendorRow } from "@/lib/data/purchasing";

const COUNTRY_OPTIONS = [
  "Bangladesh",
  "China",
  "Taiwan",
  "Germany",
  "United States",
  "United Kingdom",
  "Japan",
  "South Korea",
  "Singapore",
  "Vietnam",
];

export default function NewVendorPage() {
  const router = useRouter();
  const appToast = useToast();

  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+880 1");
  const [country, setCountry] = useState("Bangladesh");
  const [city, setCity] = useState("Dhaka");
  const [address, setAddress] = useState("");
  const [binNumber, setBinNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [leadTime, setLeadTime] = useState(7);
  const [deliveryTerms, setDeliveryTerms] = useState("DDP Tejgaon Warehouse");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [supplyCategories, setSupplyCategories] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      appToast.error("Missing Name", "Vendor or supplier company name is required.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      appToast.error("Invalid Email", "Please enter a valid business email for this vendor.");
      return;
    }

    setIsSubmitting(true);
    const vendorId = `VND-${Math.floor(100 + Math.random() * 900)}`;

    const newVendor: VendorRow = {
      id: vendorId,
      name: name.trim(),
      email: cleanEmail,
      country,
      products: 0,
      leadTime: Math.max(1, Number(leadTime) || 7),
      onTimeRate: 100,
      totalPurchased: 0,
    };

    addRecord("res.partner.vendor", {
      ...newVendor,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim(),
      city: city.trim(),
      address: address.trim(),
      binNumber: binNumber.trim() || undefined,
      tinNumber: tinNumber.trim() || undefined,
      deliveryTerms,
      bankName: bankName.trim() || undefined,
      bankAccount: bankAccount.trim() || undefined,
      routingNumber: routingNumber.trim() || undefined,
      supplyCategories: supplyCategories.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    appToast.success(
      "Vendor registered",
      `${name.trim()} (${country}) added with standard lead time of ${leadTime} days.`
    );

    setTimeout(() => {
      router.push("/vendors");
    }, 400);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-9 w-9 cursor-pointer hover:bg-muted"
          >
            <Link href="/vendors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/vendors"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Vendors
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Supplier / Vendor
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/vendors">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Vendor
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Identity, Address & Terms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Profile */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Building className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Supplier Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Vendor / Supplier Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shenzhen Smart Tech Co., Ltd."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. David Lin (Export Sales Director)"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Official Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="sales@supplier.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Telephone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="+86 138-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Country of Origin</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">City / Manufacturing Hub</label>
                <input
                  type="text"
                  placeholder="e.g. Shenzhen / Dhaka"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-foreground">Factory / Office Address</label>
              <input
                type="text"
                placeholder="Building No, Industrial Tech Park, District..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Statutory Registration & Banking Information */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Landmark className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Tax Registration & Settlement Banking</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  BIN (Business Identification Number)
                </label>
                <input
                  type="text"
                  placeholder="001928374-0101"
                  value={binNumber}
                  onChange={(e) => setBinNumber(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Tax Identification (TIN)</label>
                <input
                  type="text"
                  placeholder="e.g. 7829-1029-3849"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Settlement Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Standard Chartered / HSBC / EBL"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Bank Account / IBAN</label>
                <input
                  type="text"
                  placeholder="Account or IBAN Number"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Operations, Lead Time & Notes */}
        <div className="space-y-6">
          {/* Delivery & Operations Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Lead Time & Incoterms</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Average Purchase Lead Time (Days)
              </label>
              <input
                type="number"
                min="1"
                value={leadTime}
                onChange={(e) => setLeadTime(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
              <p className="text-[11px] text-muted-foreground">
                Used by MRP reorder engine to schedule replenishment runs.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">Preferred Delivery Terms</label>
              <select
                value={deliveryTerms}
                onChange={(e) => setDeliveryTerms(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="DDP Tejgaon Warehouse">DDP (Delivered Duty Paid Tejgaon)</option>
                <option value="CIF Chittagong Port">CIF (Cost, Insurance & Freight Ctg)</option>
                <option value="FOB Shenzhen">FOB Shenzhen (Air / Sea Freight)</option>
                <option value="Ex-Works Factory">Ex-Works (Supplier Warehouse)</option>
              </select>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-foreground">Supply Categories</label>
              <input
                type="text"
                placeholder="e.g. GaN ICs, Audio drivers, Battery Cells"
                value={supplyCategories}
                onChange={(e) => setSupplyCategories(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Supplier Notes */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Vendor Notes</h2>
            </div>
            <textarea
              rows={4}
              placeholder="Contractual MOQs, ISO certifications, RMA replacement policy..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
