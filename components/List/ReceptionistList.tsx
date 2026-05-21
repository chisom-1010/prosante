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

import { Card, CardContent } from "@/components/ui/card";

import { HugeiconsIcon } from "@hugeicons/react";

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
  LeftToRightListBulletIcon,
  Search01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

export const schema = z.object({
  receptionist_id: z.uuid(),
  receptionist_name: z.string(),
  receptionist_email: z.string().email(),
});

type ReceptionistRow = z.infer<typeof schema>;

const columns: ColumnDef<ReceptionistRow>[] = [
  {
    accessorKey: "receptionist_id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm text-[#64748b]">
       {row.original.receptionist_id}
      </div>
    ),
  },

  {
    accessorKey: "receptionist_name",
    header: "RÉCEPTIONNISTE",
    cell: ({ row }) => {
      const initials = row.original.receptionist_name
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
              {row.original.receptionist_name}
            </p>

            <p className="text-xs text-muted-foreground">
              Personnel d'accueil
            </p>
          </div>
        </div>
      );
    },

    enableHiding: false,
  },

  {
    accessorKey: "receptionist_email",
    header: "EMAIL",
    cell: ({ row }) => (
      <div className="font-medium text-[#1f2f46]">
        {row.original.receptionist_email}
      </div>
    ),
  },
];

export default function ReceptionistsList() {
  const [data, setData] = React.useState<ReceptionistRow[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [rowSelection, setRowSelection] = React.useState({});

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  React.useEffect(() => {
    const fetchReceptionists = async () => {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "get_receptionists_dashboard"
      );

      if (error) {
        console.error("Failed to fetch receptionists dashboard:", error);
        setLoading(false);
        return;
      }

      const parsed = z.array(schema).safeParse(data ?? []);

      if (!parsed.success) {
        console.error("Invalid receptionists dashboard payload:", parsed.error);
        setLoading(false);
        return;
      }

      setData(parsed.data);
      setLoading(false);
    };

    fetchReceptionists();
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

    getRowId: (row) => row.receptionist_email,

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
        {/* Stats Card */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-[#d6dde8] bg-white shadow-none">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-[#64748b] uppercase tracking-wide">
                  Réceptionnistes
                </p>

                <h2 className="mt-2 text-4xl font-bold text-[#14233c]">
                  {data.length}
                </h2>
              </div>

              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#dff4f0]">
                <HugeiconsIcon
                  icon={UserGroupIcon}
                  className="size-7 text-[#0c7a75]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <div className="overflow-hidden rounded-2xl border border-[#d6dde8] bg-white">
          {/* Header */}
          <div className="flex flex-col justify-between gap-5 border-b border-[#d6dde8] px-8 py-8 lg:flex-row lg:items-center">
            <h2 className="text-4xl font-bold uppercase tracking-wide text-[#48628c]">
              Gestion des Réceptionnistes
            </h2>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#6b7280]"
                />

                <Input
                  id="receptionist-filter"
                  placeholder="Rechercher par nom..."
                  value={
                    (table
                      .getColumn("receptionist_name")
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn("receptionist_name")
                      ?.setFilterValue(event.target.value)
                  }
                  className="h-14 w-[340px] rounded-xl border-[#d6dde8] bg-white pl-12 text-base"
                />
              </div>

              {/* Columns */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-14 rounded-xl border-[#d6dde8]"
                  >
                    <HugeiconsIcon icon={LeftToRightListBulletIcon} />

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
                    Aucun réceptionniste trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
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