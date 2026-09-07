import { Bell, Building2, CreditCard, ShieldCheck, ChevronRight } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";

const settings = [
	{ title: "Store profile", description: "Manage your store name, contact details, and branding.", icon: Building2, tone: "violet" },
	{ title: "Notifications", description: "Choose which order and inventory updates you receive.", icon: Bell, tone: "blue" },
	{ title: "Team permissions", description: "Control access for everyone working in ShopAdmin.", icon: ShieldCheck, tone: "green" },
	{ title: "Billing preferences", description: "Manage invoices, payment details, and billing settings.", icon: CreditCard, tone: "amber" },
];

export default function SettingsPage() { return <DashboardLayout><div className="content"><PageHeader eyebrow="Tools / Settings" title="Settings" subtitle="Configure the workspace and store preferences." /><section className="panel settings-list settings-menu">{settings.map(({ title, description, icon: Icon, tone }) => <button className="settings-option" type="button" key={title}><i className={`settings-option-icon ${tone}`}><Icon size={20} /></i><span><b>{title}</b><small>{description}</small></span><ChevronRight className="settings-chevron" size={19} /></button>)}</section></div></DashboardLayout>; }
