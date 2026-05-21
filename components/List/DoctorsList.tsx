"use client";

import * as React from "react";
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
  Delete02Icon,
  LeftToRightListBulletIcon,
  Search01Icon,
  Doctor01Icon,
  Calendar01Icon,
  FirstAidKitIcon,
} from "@hugeicons/core-free-icons";

export const schema = z.object({
  doctor_name: z.string(),
  doctor_email: z.string().email(),
  service: z.string(),
  appointments_count: z.number(),
});

type DoctorRow = z.infer<typeof schema>;

const columns: ColumnDef<DoctorRow>[] = [
  {
    accessorKey: "doctor_name",
    header: "MÉDECIN",
    cell: ({ row }) => {
      const initials = row.original.doctor_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2);

      return (
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-[#dff4f0] font-semibold text-[#0c6b67]">
            {initials}
          </div>

          <div>
            <p className="font-semibold text-[#14233c]">
              {row.original.doctor_name}
            </p>

            <p className="text-xs text-muted-foreground">
              Médecin enregistré
            </p>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },

  {
    accessorKey: "doctor_email",
    header: "EMAIL",
    cell: ({ row }) => (
      <div className="font-medium text-[#44556c]">
        {row.original.doctor_email}
      </div>
    ),
  },

  {
    accessorKey: "service",
    header: "SERVICE MÉDICAL",
    cell: ({ row }) => (
      <div className="inline-flex rounded-full bg-[#e8f1ff] px-4 py-1 text-sm font-medium text-[#48628c]">
        {row.original.service}
      </div>
    ),
  },

  {
    accessorKey: "appointments_count",
    header: () => <div className="text-right">RENDEZ-VOUS</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold text-[#14233c]">
        {row.original.appointments_count}
      </div>
    ),
  },

  {
    accessorKey: "Action",
    header: () => <div className="text-center">ACTION</div>,
    cell: () => (
      <div className="flex justify-center">
        <button className="flex size-10 items-center justify-center rounded-xl bg-[#fde8e8] text-[#cf2f2f] transition hover:bg-[#f8d5d5]">
          <HugeiconsIcon icon={Delete02Icon} className="size-5" />
        </button>
      </div>
    ),
  },
];

export default function DoctorsList() {
  const [data, setData] = React.useState<DoctorRow[]>([]);
  const [loading, setLoading] = React.useState(true);

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
    const fetchDoctors = async () => {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "get_doctors_dashboard"
      );

      if (error) {
        console.error(
          "Failed to fetch doctors dashboard:",
          error
        );

        setLoading(false);

        return;
      }

      const parsed = z.array(schema).safeParse(data ?? []);

      if (!parsed.success) {
        console.error(
          "Invalid doctors dashboard payload:",
          parsed.error
        );

        setLoading(false);

        return;
      }

      setData(parsed.data);

      setLoading(false);
    };

    fetchDoctors();
  }, []);

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

    getRowId: (row) => row.doctor_email,

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
      <main className="mx-auto max-w-[1500px] px-6 py-10 md:px-10 rounded-lg">

        {/* TOP STATS */}
        <div className="mb-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">

          <Card className="border-[#d6dde8] bg-white shadow-none">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#dff4f0]">
                  <HugeiconsIcon
                    icon={Doctor01Icon}
                    className="size-6 text-[#0c7a75]"
                  />
                </div>

                <div className="rounded-lg bg-[#dff4f0] px-4 py-2 text-xl font-bold text-[#0c7a75]">
                  {data.length}
                </div>
              </div>

              <p className="text-lg font-semibold text-[#384252]">
                Nombre Total de Médecins
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#d6dde8] bg-white shadow-none">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#e4ecff]">
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    className="size-6 text-[#48628c]"
                  />
                </div>

                <div className="rounded-lg bg-[#e4ecff] px-4 py-2 text-xl font-bold text-[#48628c]">
                  {data.reduce(
                    (acc, doctor) =>
                      acc + doctor.appointments_count,
                    0
                  )}
                </div>
              </div>

              <p className="text-lg font-semibold text-[#384252]">
                Rendez-vous Totaux
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#d6dde8] bg-white shadow-none">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#eef1f5]">
                  <HugeiconsIcon
                    icon={FirstAidKitIcon}
                    className="size-6 text-[#556274]"
                  />
                </div>

                <div className="rounded-lg bg-[#eef1f5] px-4 py-2 text-xl font-bold text-[#556274]">
                  {
                    new Set(
                      data.map((doctor) => doctor.service)
                    ).size
                  }
                </div>
              </div>

              <p className="text-lg font-semibold text-[#384252]">
                Services Médicaux
              </p>
            </CardContent>
          </Card>
        </div>

        {/* TABLE CARD */}
        <div className="overflow-hidden rounded-3xl border border-[#d6dde8] bg-white">

          {/* HEADER */}
          <div className="flex flex-col justify-between gap-5 border-b border-[#d6dde8] px-8 py-8 lg:flex-row lg:items-center">

            <div>
              <h2 className="text-4xl font-bold uppercase tracking-wide text-[#48628c]">
                Gestion des Médecins
              </h2>

              <p className="mt-2 text-base text-[#6b7280]">
                Consultez et gérez l’ensemble du personnel médical.
              </p>
            </div>

            <div className="flex items-center gap-4">

              {/* SEARCH */}
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#6b7280]"
                />

                <Input
                  id="doctor-filter"
                  placeholder="Rechercher un médecin..."
                  value={
                    (table
                      .getColumn("doctor_name")
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn("doctor_name")
                      ?.setFilterValue(event.target.value)
                  }
                  className="h-14 w-[360px] rounded-xl border-[#d6dde8] bg-white pl-12 text-base"
                />
              </div>

              {/* COLUMNS */}
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

                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                    />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-44"
                >
                  {table
                    .getAllColumns()
                    .filter((column) =>
                      column.getCanHide()
                    )
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

          {/* TABLE */}
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
                      colSpan={header.colSpan}
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
                    data-state={
                      row.getIsSelected() && "selected"
                    }
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
                    Aucun médecin trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex flex-col justify-between gap-5 border-t border-[#d6dde8] bg-[#eef3ff] px-8 py-5 lg:flex-row lg:items-center">

            <div className="flex items-center gap-3">
              <Label className="text-base font-medium text-[#384252]">
                Lignes par page :
              </Label>

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
                    {[10, 20, 30, 40, 50].map(
                      (pageSize) => (
                        <SelectItem
                          key={pageSize}
                          value={`${pageSize}`}
                        >
                          {pageSize}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <p className="ml-4 text-base text-[#384252]">
                {table.getState().pagination.pageIndex + 1}
                -
                {table.getPageCount()} sur {data.length}
              </p>
            </div>

            <div className="flex items-center gap-3">

              <Button
                variant="outline"
                className="hidden size-10 border-[#cbd5e1] bg-white lg:flex"
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
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                />
              </Button>

              <Button
                variant="outline"
                className="hidden size-10 border-[#cbd5e1] bg-white lg:flex"
                onClick={() =>
                  table.setPageIndex(
                    Math.max(
                      table.getPageCount() - 1,
                      0
                    )
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