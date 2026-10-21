"use client";

import * as React from "react";
import Link from "next/link";
import { z } from "zod";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shell/StatCard";
import { StatusBadge } from "@/components/shell/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  LeftToRightListBulletIcon,
  Login03Icon,
  Search01Icon,
  TaskDone01Icon,
  Time04Icon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";
import { TIME_SLOTS } from "@/lib/appointments";
import AppointmentActions from "../actions/AppointmentActions";
import { updateAppointmentTime } from "../actions/UpdateAppointmentTime";

const appointmentSchema = z.object({
  id: z.union([z.uuid()]),
  status: z.string(),
  patient_name: z.string(),
  date_de_rendezvous: z.string(),
  tranche_horaires: z.string(),
  id_service_medical: z.string(),
  service: z.string(),
  doctor_name: z.string().nullable().optional(),
});

const statsSchema = z.object({
  pending: z.int(),
  accepted: z.int(),
  postponed: z.int(),
  cancelled: z.int(),
  in_progress: z.int(),
  done: z.int(),
});

type Appointment = z.infer<typeof appointmentSchema>;
type ReceptionistStats = z.infer<typeof statsSchema>;

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
              ID: #{String(row.original.id).slice(0, 4)}
            </p>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "appointment_date",
    header: "DATE",
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">
        {row.original.date_de_rendezvous}
      </div>
    ),
  },
  {
    accessorKey: "tranche_horaires",
    header: "HORAIRES",
    cell: ({ row }) => {
      return (
        <Select
          defaultValue={row.original.tranche_horaires}
          onValueChange={(value) =>
            updateAppointmentTime(row.original.id as string, value)
          }
        >
          <SelectTrigger className="w-[160px] border-slate-200 bg-white">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {TIME_SLOTS.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: "status",
    header: "STATUT",
    cell: ({ row }) => (
      <StatusBadge status={row.original.status} />
    ),
  },
  {
    accessorKey: "service",
    header: "SERVICE MÉDICAL",
    cell: ({ row }) => (
      <div className="font-medium text-slate-900">
        {row.original.service}
      </div>
    ),
  },

  // ✅ Doctor Pill
  {
    accessorKey: "doctor_name",
    header: "MÉDECIN",
    cell: ({ row }) => {
      const doctor = row.original.doctor_name;

      return doctor ? (
        <div className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-1 text-sm font-medium text-emerald-700">
          Dr. {doctor}
        </div>
      ) : (
        <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1 text-sm text-slate-500">
          Non assigné
        </div>
      );
    },
  },

  {
    id: "actions",
    header: () => <div className="text-center">ACTION</div>,
    cell: ({ row }) => <AppointmentActions appointment={row.original} />,
  },
];

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
    icon: Login03Icon,
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

export default function ReceptionistDashboard() {
  const supabase = React.useMemo(() => createClient(), []);
  const [data, setData] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [stats, setStats] = React.useState<ReceptionistStats>({
    pending: 0,
    accepted: 0,
    postponed: 0,
    cancelled: 0,
    in_progress: 0,
    done: 0,
  });

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      const [
        { data: appointmentsData, error: appointmentsError },
        { data: statsData, error: statsError },
      ] = await Promise.all([
        supabase.rpc("get_receptionist_dashboard"),
        supabase.rpc("get_receptionist_stats"),
      ]);

      if (appointmentsError) {
        console.error(appointmentsError);
      } else {
        const parsedAppointments = z
          .array(appointmentSchema)
          .safeParse(appointmentsData ?? []);

        if (parsedAppointments.success) {
          setData(parsedAppointments.data);
        }
      }

      if (!statsError) {
        const firstStat = Array.isArray(statsData)
          ? statsData[0]
          : undefined;

        const parsedStats = statsSchema.safeParse(firstStat);

        if (parsedStats.success) {
          setStats(parsedStats.data);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },

    getRowId: (row) => String(row.id),

    enableRowSelection: true,

    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
              value={stats[item.key as keyof ReceptionistStats]}
              icon={item.icon}
              iconBg={item.bg}
              iconColor={item.color}
            />
          ))}
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {/* Top */}
          <div className="flex flex-col justify-between gap-5 border-b border-slate-200 px-6 py-6 md:px-8 lg:flex-row lg:items-center">
            <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
              Gestion des Rendez-vous
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
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
                  className="h-12 w-full sm:w-[320px] rounded-xl border-slate-200 bg-white pl-12 text-base"
                />
              </div>

              {/* Columns */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl border-slate-200"
                  >
                    <HugeiconsIcon
                      icon={LeftToRightListBulletIcon}
                    />

                    Colonnes

                    <HugeiconsIcon icon={ArrowDown01Icon} />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-44">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                        className="capitalize"
                      >
                        {column.id.replaceAll("_", " ")}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(
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
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
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

              <p className="ml-4 text-base text-slate-700">
                {table.getState().pagination.pageIndex + 1}-
                {table.getPageCount()} sur {data.length}
              </p>
            </div>

            <div className="flex items-center gap-3">
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
                className="hidden size-10 border-slate-200 bg-white lg:flex"
                onClick={() =>
                  table.setPageIndex(
                    Math.max(table.getPageCount() - 1, 0)
                  )
                }
                disabled={!table.getCanNextPage()}
              >
                <HugeiconsIcon icon={ArrowRightDoubleIcon} />
              </Button>

              <Button
                variant="outline"
                className="hidden size-10 border-slate-200 bg-white lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <HugeiconsIcon icon={ArrowLeftDoubleIcon} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}