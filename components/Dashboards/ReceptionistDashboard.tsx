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
import { Separator } from "@/components/ui/separator";
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
  LeftToRightListBulletIcon,
} from "@hugeicons/core-free-icons";

const appointmentSchema = z.object({
  id: z.union([z.string(), z.number()]),
  status: z.string(),
  patient_name: z.string(),
  appointment_date: z.string(),
  tranche_horaires: z.string(),
});

const statsSchema = z.object({
  pending: z.number(),
});

type Appointment = z.infer<typeof appointmentSchema>;
type ReceptionistStats = z.infer<typeof statsSchema>;

const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "patient_name",
    header: "Patient",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.patient_name}</div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "appointment_date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.appointment_date}
      </div>
    ),
  },
  {
    accessorKey: "tranche_horaires",
    header: "Horaires",
    cell: ({ row }) => <div>{row.original.tranche_horaires}</div>,
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <div className="capitalize text-muted-foreground">
        {row.original.status}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="w-full text-right">Action</div>,
    cell: ({ row }) => {
      const isPending = row.original.status === "en attente";

      return (
        <div className="flex justify-end">
          {isPending ? (
            <Button size="sm">ACCEPTER</Button>
          ) : (
            <Button variant="outline" size="sm">
              DÉTAILS
            </Button>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

export default function ReceptionistDashboard() {
  const supabase = React.useMemo(() => createClient(), []);

  const [data, setData] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<ReceptionistStats>({
    pending: 0,
  });

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
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
        console.error(
          "Failed to fetch receptionist dashboard appointments:",
          appointmentsError,
        );
      } else {
        const parsedAppointments = z
          .array(appointmentSchema)
          .safeParse(appointmentsData ?? []);

        if (parsedAppointments.success) {
          setData(parsedAppointments.data);
        } else {
          console.error(
            "Invalid receptionist appointments payload:",
            parsedAppointments.error,
          );
        }
      }

      if (statsError) {
        console.error("Failed to fetch receptionist stats:", statsError);
      } else {
        const firstStat = Array.isArray(statsData) ? statsData[0] : undefined;
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
    <div className="min-h-screen bg-background">
      <main className="p-6 md:p-12">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card>
            <CardContent className="py-6">
              <div className="border-l pl-6">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground">
                  RENDEZ-VOUS ACCEPTÉS
                </p>
                <p className="text-6xl font-light">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-widest">
            GESTION DES RENDEZ-VOUS
          </h2>
          <Link
            href="/doctors/appointments"
            className="text-xs text-muted-foreground hover:underline"
          >
            TOUT VOIR
          </Link>
        </div>

        <Separator className="mb-8" />

        <div className="w-full flex-col justify-start gap-6">
          <div className="flex items-center justify-between gap-4 px-1 pb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="appointment-filter" className="sr-only">
                Rechercher un patient
              </Label>
              <Input
                id="appointment-filter"
                placeholder="Rechercher par patient..."
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
                className="h-8 w-[220px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <HugeiconsIcon
                      icon={LeftToRightListBulletIcon}
                      strokeWidth={2}
                      data-icon="inline-start"
                    />
                    Colonnes
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      strokeWidth={2}
                      data-icon="inline-end"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id.replaceAll("_", " ")}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
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
                      className="h-24 text-center"
                    >
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Aucun rendez-vous trouvé.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-4 pt-4">
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} sur{" "}
              {table.getFilteredRowModel().rows.length} ligne(s)
              sélectionnée(s).
            </div>

            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Lignes par page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    <SelectGroup>
                      {[10, 20, 30, 40, 50].map((pageSize) => (
                        <SelectItem key={pageSize} value={`${pageSize}`}>
                          {pageSize}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} sur{" "}
                {table.getPageCount() || 1}
              </div>

              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Aller à la première page</span>
                  <HugeiconsIcon icon={ArrowLeftDoubleIcon} strokeWidth={2} />
                </Button>

                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Page précédente</span>
                  <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                </Button>

                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Page suivante</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                </Button>

                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() =>
                    table.setPageIndex(Math.max(table.getPageCount() - 1, 0))
                  }
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Aller à la dernière page</span>
                  <HugeiconsIcon icon={ArrowRightDoubleIcon} strokeWidth={2} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
