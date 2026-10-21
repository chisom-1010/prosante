"use client";

import { STATUS_LABELS, statusOptions, type Status } from "@/lib/appointments";
import { toast } from "sonner";
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
import { StatCard } from "@/components/shell/StatCard";
import { StatusBadge } from "@/components/shell/StatusBadge";

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

  if (error) {
    toast.error(
      error.code === "23514"
        ? error.message
        : "Impossible de modifier le statut.",
    );
  } else {
    window.location.reload();
  }
};

const statsCards = [
  {
    label: "Rendez-vous Acceptés",
    key: "accepted",
    icon: CheckmarkCircle02Icon,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    label: "Rendez-vous en Attente",
    key: "pending",
    icon: Time04Icon,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
  },
  {
    label: "Rendez-vous Reportés",
    key: "postponed",
    icon: UserAccountIcon,
    color: "text-slate-700",
    bg: "bg-slate-100",
  },
  {
    label: "Rendez-vous en Cours",
    key: "in_progress",
    icon: UserAccountIcon,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    label: "Rendez-vous Annulés",
    key: "cancelled",
    icon: Cancel01Icon,
    color: "text-red-700",
    bg: "bg-red-50",
  },
  {
    label: "Rendez-vous Terminés",
    key: "done",
    icon: TaskDone01Icon,
    color: "text-cyan-700",
    bg: "bg-cyan-50",
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
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 font-semibold text-emerald-700">
              {initials}
            </div>

            <div>
              <p className="font-medium text-slate-900">
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
        <div className="font-medium text-slate-900">
          {row.original.appointment_date}
        </div>
      ),
    },

    {
      accessorKey: "tranche_horaires",
      header: "HORAIRES",
      cell: ({ row }) => (
        <div className="font-medium text-slate-900">
          {row.original.tranche_horaires}
        </div>
      ),
    },

    {
      accessorKey: "status",
      header: "STATUT",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} />
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
            <SelectTrigger className="w-[170px] border-slate-200 bg-white">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {statusOptions(appointment.status, ["en cours", "fini"]).map(
                (s: Status) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ),
              )}
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
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {statsCards.map((item) => (
            <StatCard
              key={item.key}
              title={item.label}
              value={stats[item.key as keyof DoctorStats]}
              icon={item.icon}
              iconBg={item.bg}
              iconColor={item.color}
            />
          ))}
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {/* Top */}
          <div className="flex flex-col justify-between gap-5 border-b border-slate-200 px-6 py-6 md:px-8 lg:flex-row lg:items-center">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
              Gestion des Rendez-vous
            </h2>

            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500"
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
                className="h-12 w-full sm:w-[340px] rounded-xl border-slate-200 bg-white pl-12 text-base"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-slate-200"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-14 text-xs font-semibold uppercase tracking-wide text-slate-500"
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
                    className="border-slate-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-4 text-sm text-slate-900"
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
          </div>

          {/* Pagination */}
          <div className="flex flex-col justify-between gap-5 border-t border-slate-200 bg-slate-50 px-6 py-4 md:px-8 lg:flex-row lg:items-center">
            <div className="flex items-center gap-3">
              <p className="text-base font-medium text-slate-700">
                Lignes par page :
              </p>

              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) =>
                  table.setPageSize(Number(value))
                }
              >
                <SelectTrigger className="w-20 border-slate-200 bg-white">
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
                className="size-10 border-slate-200 bg-white"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <HugeiconsIcon
                  icon={ArrowLeftDoubleIcon}
                />
              </Button>

              <Button
                variant="outline"
                className="size-10 border-slate-200 bg-white"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} />
              </Button>

              <div className="flex size-10 items-center justify-center rounded-md bg-emerald-700 font-semibold text-white">
                {table.getState().pagination.pageIndex + 1}
              </div>

              <Button
                variant="outline"
                className="size-10 border-slate-200 bg-white"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} />
              </Button>

              <Button
                variant="outline"
                className="size-10 border-slate-200 bg-white"
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
      </div>
    </div>
  );
}