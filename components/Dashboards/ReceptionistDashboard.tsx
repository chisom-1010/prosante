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
import { Card, CardContent } from "@/components/ui/card";
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

const getStatusBadge = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized.includes("accepté")) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalized.includes("en attente")) {
    return "bg-blue-100 text-blue-700";
  }

  if (normalized.includes("en cours")) {
    return "bg-cyan-100 text-cyan-700";
  }

  if (normalized.includes("annulé")) {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
};

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
      <div className="font-medium text-[#1f2f46]">
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
          <SelectTrigger className="w-[160px] border-[#d4dbe8] bg-white">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="08h00 - 09h00">
              08h00 - 09h00
            </SelectItem>

            <SelectItem value="09h00 - 10h00">
              09h00 - 10h00
            </SelectItem>

            <SelectItem value="10h00 - 11h00">
              10h00 - 11h00
            </SelectItem>

            <SelectItem value="11h00 - 12h00">
              11h00 - 12h00
            </SelectItem>

            <SelectItem value="14h00 - 15h00">
              14h00 - 15h00
            </SelectItem>

            <SelectItem value="15h00 - 16h00">
              15h00 - 16h00
            </SelectItem>

            <SelectItem value="16h00 - 17h00">
              16h00 - 17h00
            </SelectItem>
          </SelectContent>
        </Select>
      );
    },
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
    accessorKey: "service",
    header: "SERVICE MÉDICAL",
    cell: ({ row }) => (
      <div className="font-medium text-[#1f2f46]">
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
        <div className="inline-flex items-center rounded-full bg-[#d9f3ef] px-4 py-1 text-sm font-medium text-[#0c6b67]">
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
    icon: Login03Icon,
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
                          item.key as keyof ReceptionistStats
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

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-[#d6dde8] bg-white">
          {/* Top */}
          <div className="flex flex-col justify-between gap-5 border-b border-[#d6dde8] px-8 py-8 lg:flex-row lg:items-center">
            <h2 className="text-4xl font-bold uppercase tracking-wide text-[#48628c]">
              Gestion des Rendez-vous
            </h2>

            <div className="flex items-center gap-4">
              {/* Search */}
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
                  className="h-14 w-[360px] rounded-xl border-[#d6dde8] bg-white pl-12 text-base"
                />
              </div>

              {/* Columns */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-14 rounded-xl border-[#d6dde8]"
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
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
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

              <p className="ml-4 text-base text-[#384252]">
                {table.getState().pagination.pageIndex + 1}-
                {table.getPageCount()} sur {data.length}
              </p>
            </div>

            <div className="flex items-center gap-3">
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
                className="hidden size-10 border-[#cbd5e1] bg-white lg:flex"
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
                className="hidden size-10 border-[#cbd5e1] bg-white lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <HugeiconsIcon icon={ArrowLeftDoubleIcon} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}