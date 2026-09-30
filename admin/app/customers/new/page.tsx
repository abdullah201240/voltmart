"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  CreditCard,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/app-feedback";
import { addRecord } from "@/lib/data/ops";
import { CustomerRow } from "@/lib/data/customers";

const AVAILABLE_TAGS = ["VIP", "Wholesale", "Repeat", "New", "Corporate", "Retail"];

export default function NewCustomerPage() {
  const router = useRouter();
  const appToast = useToast();

  const [customerType, setCustomerType] = useState<"individual" | "company">("individual");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [binNumber, setBinNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+880 1");
  const [division, setDivision] = useState("Dhaka");
  const [city, setCity] = useState("Dhaka");
  const [thana, setThana] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["New"]);
  const [creditLimit, setCreditLimit] = useState(0);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      appToast.error("Missing Name", "Customer name is required.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      appToast.error("Invalid Email", "Please enter a valid customer email.");
      return;
    }

    setIsSubmitting(true);
    const customerId = `CUS-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCustomer: CustomerRow = {
      id: customerId,
      name: name.trim(),
      email: cleanEmail,
      country: "Bangladesh",
      city: city.trim() || division,
      orders: 0,
      totalSpent: 0,
      joined: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      tags: selectedTags,
      status: "Active",
    };

    addRecord("res.partner", {
      ...newCustomer,
      customerType,
      companyName: customerType === "company" ? companyName.trim() : undefined,
      binNumber: customerType === "company" ? binNumber.trim() : undefined,
      phone: phone.trim(),
      division,
      thana: thana.trim(),
      address: address.trim(),
      postalCode: postalCode.trim(),
      creditLimit,
      notes: notes.trim(),
    });

    appToast.success(
      "Customer registered",
      `${name.trim()} (${cleanEmail}) has been added to your directory.`
    );

    setTimeout(() => {
      router.push("/customers");
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
            <Link href="/customers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/customers"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wider"
              >
                Customers
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Create
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mt-0.5">
              New Customer
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-11 px-5 cursor-pointer">
            <Link href="/customers">Discard</Link>
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="h-11 px-6 cursor-pointer active:scale-[0.98] transition-all"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Customer
          </Button>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left 2 Cols: Profile & Address */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Account Type Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Customer Profile</h2>
              </div>
              {/* Account Type Selector */}
              <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCustomerType("individual")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-all cursor-pointer ${
                    customerType === "individual"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType("company")}
                  className={`rounded-md px-3 py-1.5 font-medium transition-all cursor-pointer ${
                    customerType === "company"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Corporate / Business
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  {customerType === "company" ? "Contact Person Name" : "Full Name"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Asif Mahmud"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              {customerType === "company" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Registered Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Technologies Ltd."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="customer@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="+880 1700-000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {customerType === "company" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    13-digit BIN / NBR VAT Reg.
                  </label>
                  <input
                    type="text"
                    placeholder="001234567-0101"
                    value={binNumber}
                    onChange={(e) => setBinNumber(e.target.value)}
                    className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Shipping & Billing Address Card */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Primary Address (Bangladesh)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Division</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">City / District</label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka North"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Thana / Area</label>
                <input
                  type="text"
                  placeholder="e.g. Gulshan-2, Uttara, Dhanmondi"
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Street Address & House / Flat No.
                </label>
                <input
                  type="text"
                  placeholder="House 42, Road 11, Block D"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Postal Code</label>
                <input
                  type="text"
                  placeholder="1212"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Tags, Credit Limit & Notes */}
        <div className="space-y-6">
          {/* Segment Tags */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Customer Tags & Segment</h2>
            </div>

            <p className="text-xs text-muted-foreground">
              Assign behavioral or tier tags for tailored discount campaigns and priority fulfillment.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-muted-foreground border-border/80 hover:text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Credit Terms */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Credit & Payment Terms</h2>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Credit Limit (৳ BDT)</label>
              <input
                type="number"
                min="0"
                step="5000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
              />
              <p className="text-[11px] text-muted-foreground">
                Set non-zero for corporate net-30 / net-60 invoiced billing accounts.
              </p>
            </div>
          </div>

          {/* Internal Notes */}
          <div className="rounded-lg border border-border/80 bg-card p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Customer Notes</h2>
            </div>
            <textarea
              rows={4}
              placeholder="Any special handling preferences, VIP status remarks, or support history..."
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
