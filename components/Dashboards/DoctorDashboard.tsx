"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { HugeiconsIcon } from "@hugeicons/react";

import {
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Search01Icon,
  TaskDone01Icon,
  Time04Icon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";

type Appointment = {
  id: string;
  status: string;
  patient_name: string;
  appointment_date: string;
  tranche_horaires: string;
};

type DoctorStats = {
  pending: number;
  accepted: number;
  postponed: number;
  cancelled: number;
  in_progress: number;
  done: number;
};

const updateStatus = async (id: string, status: string) => {
  const supabase = createClient();

  const { error } = await supabase
    .from("demande_de_consultation")
    .update({ status })
    .eq("id", id);

  if (error) console.error(error);
  else window.location.reload();
};

const getStatusBadge = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized.includes("accept")) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalized.includes("attente")) {
    return "bg-blue-100 text-blue-700";
  }

  if (normalized.includes("cours")) {
    return "bg-cyan-100 text-cyan-700";
  }

  if (normalized.includes("annul")) {
    return "bg-red-100 text-red-700";
  }

  if (normalized.includes("fini")) {
    return "bg-slate-200 text-slate-700";
  }

  return "bg-slate-100 text-slate-700";
};

const statsCards = [
  {
    label: "Rendez-vous Acceptés",
    key: "accepted",
    icon: CheckmarkCircle02Icon,
    color: "text-[#0c7a75]",
    bg: "bg-[#dff4f0]",
  },
  {
    label: "Rendez-vous en Attente",
    key: "pending",
    icon: Time04Icon,
    color: "text-[#4f6ea7]",
    bg: "bg-[#e4ecff]",
  },
  {
    label: "Rendez-vous Reportés",
    key: "postponed",
    icon: UserAccountIcon,
    color: "text-[#6d7280]",
    bg: "bg-[#eef1f5]",
  },
  {
    label: "Rendez-vous en Cours",
    key: "in_progress",
    icon: UserAccountIcon,
    color: "text-[#0c7a75]",
    bg: "bg-[#dff4f0]",
  },
  {
    label: "Rendez-vous Annulés",
    key: "cancelled",
    icon: Cancel01Icon,
    color: "text-[#cf2f2f]",
    bg: "bg-[#fde8e8]",
  },
  {
    label: "Rendez-vous Terminés",
    key: "done",
    icon: TaskDone01Icon,
    color: "text-[#1f2f46]",
    bg: "bg-[#eceff5]",
  },
];

export default function DoctorDashboard() {
  const supabase = React.useMemo(() => createClient(), []);

  const [appointments, setAppointments] = React.useState<Appointment[]>([]);

  const [stats, setStats] = React.useState<DoctorStats>({
    accepted: 0,
    postponed: 0,
    pending: 0,
    cancelled: 0,
    done: 0,
    in_progress: 0,
  });

  const [loading, setLoading] = React.useState(true);

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);

  const [pagination, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });

  React.useEffect(() => {
    const fetchData = async () => {
      const [{ data: appts }, { data: stat }] = await Promise.all([
        supabase.rpc("get_doctor_dashboard"),
        supabase.rpc("get_doctor_stats"),
      ]);

      if (appts) {
        setAppointments(appts as Appointment[]);
      }

      if (stat && stat.length > 0) {
        setStats({
          accepted: stat[0].accepted,
          postponed: stat[0].postponed,
          cancelled: stat[0].cancelled,
          done: stat[0].done,
          in_progress: stat[0].in_progress,
          pending: stat[0].pending,
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "patient_name",
      header: "PATIENT",
      cell: ({ row }) => {
        const initials = row.original.patient_name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#dce7ff] font-semibold text-[#3f5d94]">
              {initials}
            </div>

            <div>
              <p className="font-medium text-[#14233c]">
                {row.original.patient_name}
              </p>

              <p className="text-xs text-muted-foreground">
                ID: #{row.original.id.slice(0, 4)}
              </p>
            </div>
          </div>
        );
      },
    },

    {
      accessorKey: "appointment_date",
      header: "DATE",
      cell: ({ row }) => (
        <div className="font-medium text-[#1f2f46]">
          {row.original.appointment_date}
        </div>
      ),
    },

    {
      accessorKey: "tranche_horaires",
      header: "HORAIRES",
      cell: ({ row }) => (
        <div className="font-medium text-[#1f2f46]">
          {row.original.tranche_horaires}
        </div>
      ),
    },

    {
      accessorKey: "status",
      header: "STATUT",
      cell: ({ row }) => (
        <div
          className={`inline-flex rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusBadge(
            row.original.status
          )}`}
        >
          {row.original.status}
        </div>
      ),
    },

    {
      id: "actions",
      header: () => <div className="text-center">ACTION</div>,

      cell: ({ row }) => {
        const appointment = row.original;

        return (
          <Select
            defaultValue={appointment.status}
            onValueChange={(value) =>
              updateStatus(appointment.id, value)
            }
          >
            <SelectTrigger className="w-[170px] border-[#d6dde8] bg-white">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="en cours">
                En cours
              </SelectItem>

              <SelectItem value="fini">
                Terminé
              </SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  const table = useReactTable({
    data: appointments,
    columns,

    state: {
      columnFilters,
      pagination,
    },

    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="min-h-screen bg-[#f5f7fc]">
      <main className="mx-auto max-w-[1500px] px-6 py-10 md:px-10">
        {/* Stats */}
        <div className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-6">
          {statsCards.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.key}
                className="border-[#d6dde8] bg-white shadow-none"
              >
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${item.bg}`}
                    >
                      <HugeiconsIcon
                        icon={Icon}
                        className={`size-5 ${item.color}`}
                      />
                    </div>

                    <div
                      className={`rounded-md px-3 py-1 text-lg font-semibold ${item.bg} ${item.color}`}
                    >
                      {
                        stats[
                          item.key as keyof DoctorStats
                        ] as React.ReactNode
                      }
                    </div>
                  </div>

                  <p className="text-lg font-semibold leading-snug text-[#384252]">
                    {item.label}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-2xl border border-[#d6dde8] bg-white">
          {/* Top */}
          <div className="flex flex-col justify-between gap-5 border-b border-[#d6dde8] px-8 py-8 lg:flex-row lg:items-center">
            <h2 className="text-4xl font-bold uppercase tracking-wide text-[#48628c]">
              Gestion des Rendez-vous
            </h2>

            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#6b7280]"
              />

              <Input
                placeholder="Rechercher par patient"
                value={
                  (table
                    .getColumn("patient_name")
                    ?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table
                    .getColumn("patient_name")
                    ?.setFilterValue(event.target.value)
                }
                className="h-14 w-[340px] rounded-xl border-[#d6dde8] bg-white pl-12 text-base"
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader className="bg-[#eef3ff]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-[#d6dde8]"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-16 text-sm font-bold uppercase tracking-wide text-[#1d2d44]"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-[#d6dde8]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-5 text-base text-[#1f2f46]"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    Aucun rendez-vous trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex flex-col justify-between gap-5 border-t border-[#d6dde8] bg-[#eef3ff] px-8 py-5 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <p className="text-base font-medium text-[#384252]">
                Lignes par page :
              </p>

              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) =>
                  table.setPageSize(Number(value))
                }
              >
                <SelectTrigger className="w-20 border-[#cbd5e1] bg-white">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem
                        key={pageSize}
                        value={`${pageSize}`}
                      >
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="size-10 border-[#cbd5e1] bg-white"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <HugeiconsIcon
                  icon={ArrowLeftDoubleIcon}
                />
              </Button>

              <Button
                variant="outline"
                className="size-10 border-[#cbd5e1] bg-white"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} />
              </Button>

              <div className="flex size-10 items-center justify-center rounded-md bg-[#0c6b67] font-semibold text-white">
                {table.getState().pagination.pageIndex + 1}
              </div>

              <Button
                variant="outline"
                className="size-10 border-[#cbd5e1] bg-white"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} />
              </Button>

              <Button
                variant="outline"
                className="size-10 border-[#cbd5e1] bg-white"
                onClick={() =>
                  table.setPageIndex(
                    Math.max(table.getPageCount() - 1, 0)
                  )
                }
                disabled={!table.getCanNextPage()}
              >
                <HugeiconsIcon
                  icon={ArrowRightDoubleIcon}
                />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}