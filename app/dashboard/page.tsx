"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  CreditCard,
  Ticket,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowRight,
  UserPlus,
  Wallet,
  FileText,
} from "lucide-react";
import {
  getDefaultAllowedPath,
  getRoleDisplayName,
  getUserPermissions,
  getUserRole,
} from "@/lib/roles";
import { getSessionUser } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Datos de demostración hasta que existan endpoints de resumen en el API. */
const DUMMY_KPIS = [
  {
    label: "Clientes activos",
    value: "1,284",
    hint: "+18 esta semana",
    icon: Users,
    accent: "bg-blue-50 text-blue-700",
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    label: "Cobranza del día",
    value: "$42,850",
    hint: "32 pagos registrados",
    icon: CreditCard,
    accent: "bg-emerald-50 text-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Tickets abiertos",
    value: "27",
    hint: "9 sin técnico asignado",
    icon: Ticket,
    accent: "bg-amber-50 text-amber-800",
    iconBg: "bg-amber-100 text-amber-600",
  },
  {
    label: "Ingresos del mes",
    value: "$318,420",
    hint: "+6.4% vs mes anterior",
    icon: TrendingUp,
    accent: "bg-indigo-50 text-indigo-700",
    iconBg: "bg-indigo-100 text-indigo-600",
  },
] as const;

const DUMMY_ACTIVITY = [
  {
    id: 1,
    title: "Pago recibido — Cliente #1042",
    detail: "Paquete Fibra 100 Mbps · $650.00",
    time: "Hace 12 min",
    tone: "success" as const,
  },
  {
    id: 2,
    title: "Ticket TK-087 actualizado",
    detail: "Estatus: En proceso · Técnico: R. Méndez",
    time: "Hace 28 min",
    tone: "info" as const,
  },
  {
    id: 3,
    title: "Nuevo cliente registrado",
    detail: "María López · Zona Norte",
    time: "Hace 1 h",
    tone: "info" as const,
  },
  {
    id: 4,
    title: "Gasto de caja registrado",
    detail: "Suministros · $1,200.00 · Efectivo",
    time: "Hace 2 h",
    tone: "warning" as const,
  },
  {
    id: 5,
    title: "Servicio suspendido",
    detail: "Cliente #0988 · Factura vencida",
    time: "Hace 3 h",
    tone: "danger" as const,
  },
];

const DUMMY_TICKETS = [
  { id: "TK-091", cliente: "Jorge Salas", estatus: "En proceso", prioridad: "Alta" },
  { id: "TK-090", cliente: "Ana Ruiz", estatus: "En proceso", prioridad: "Media" },
  { id: "TK-088", cliente: "Pedro Díaz", estatus: "Finalizado", prioridad: "Baja" },
  { id: "TK-085", cliente: "Laura Gómez", estatus: "En proceso", prioridad: "Alta" },
];

const DUMMY_COBRANZA = [
  { label: "Efectivo", amount: 18500, pct: 43 },
  { label: "Transferencia", amount: 15200, pct: 35 },
  { label: "Tarjeta", amount: 9150, pct: 22 },
];

const QUICK_LINKS = [
  {
    href: "/dashboard/customers",
    label: "Clientes",
    description: "Altas y consulta",
    icon: UserPlus,
    permission: "canAccessClientes" as const,
  },
  {
    href: "/dashboard/cobranza",
    label: "Cobranza",
    description: "Caja y pagos",
    icon: Wallet,
    permission: "canAccessCobranza" as const,
  },
  {
    href: "/dashboard/reportes",
    label: "Tickets",
    description: "Soporte técnico",
    icon: FileText,
    permission: "canAccessReportes" as const,
  },
];

const activityToneClass = {
  success: "bg-emerald-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
} as const;

function formatMoney(value: number) {
  return value.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  });
}

export default function DashboardHome() {
  const router = useRouter();
  const permissions = getUserPermissions();
  const user = getSessionUser();
  const roleName = getRoleDisplayName(getUserRole());

  useEffect(() => {
    if (!permissions?.canAccessInicio) {
      router.replace(getDefaultAllowedPath());
    }
  }, [permissions, router]);

  if (!permissions?.canAccessInicio) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-600">
        Redirigiendo...
      </div>
    );
  }

  const visibleLinks = QUICK_LINKS.filter(
    (link) => permissions?.[link.permission] === true
  );

  return (
    <div className="space-y-6 pb-2">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">Resumen operativo</p>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Hola{user?.nombre ? `, ${user.nombre.split(" ")[0]}` : ""}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Rol: <span className="font-medium text-gray-700">{roleName}</span>
            <span className="mx-2 text-gray-300">·</span>
            Datos de demostración (aún sin API de resumen)
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 border border-amber-100">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Vista preliminar con datos dummy
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {DUMMY_KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-gray-200 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">{kpi.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 tracking-tight">
                      {kpi.value}
                    </p>
                    <p className={`mt-2 text-xs font-medium ${kpi.accent} inline-block rounded-md px-2 py-0.5`}>
                      {kpi.hint}
                    </p>
                  </div>
                  <div className={`rounded-lg p-2.5 ${kpi.iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {visibleLinks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors"
              >
                <div className="rounded-lg bg-gray-100 p-2 text-gray-700 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{link.label}</p>
                  <p className="text-xs text-gray-500">{link.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card className="xl:col-span-3 border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base font-semibold text-gray-900">
                Actividad reciente
              </CardTitle>
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                Hoy
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-gray-100">
              {DUMMY_ACTIVITY.map((item) => (
                <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${activityToneClass[item.tone]}`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{item.detail}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400 whitespace-nowrap">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-900">
              Cobranza por método
            </CardTitle>
            <p className="text-xs text-gray-500">Distribución del día (demo)</p>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {DUMMY_COBRANZA.map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-gray-600">{row.label}</span>
                  <span className="font-medium text-gray-900">
                    {formatMoney(row.amount)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold text-gray-900">
              Tickets recientes
            </CardTitle>
            {permissions?.canAccessReportes && (
              <Link
                href="/dashboard/reportes"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 font-medium">Ticket</th>
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Estatus</th>
                <th className="pb-2 font-medium">Prioridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DUMMY_TICKETS.map((ticket) => (
                <tr key={ticket.id} className="text-gray-800">
                  <td className="py-2.5 font-medium">{ticket.id}</td>
                  <td className="py-2.5">{ticket.cliente}</td>
                  <td className="py-2.5">
                    <span
                      className={
                        ticket.estatus === "Finalizado"
                          ? "inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                          : "inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
                      }
                    >
                      {ticket.estatus}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-600">{ticket.prioridad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
