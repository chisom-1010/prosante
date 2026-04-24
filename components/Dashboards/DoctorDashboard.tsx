"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowLeft01Icon,
  ArrowLeftDoubleIcon,
  ArrowRight01Icon,
  ArrowRightDoubleIcon,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";

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
// const supabase = createClient();
// const { data: { session } } = await supabase.auth.getSession();
// console.log(session);

// // const {
// //   data: { user },
// // } = await supabase.auth.getUser();

// console.log(user);

export default function DoctorDashboard() {
  const supabase = createClient();

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

  React.useEffect(() => {
    const fetchData = async () => {
      const [{ data: appts }, { data: stat }] = await Promise.all([
        supabase.rpc("get_doctor_dashboard"),
        supabase.rpc("get_doctor_stats"),
      ]);

      if (appts) setAppointments(appts as Appointment[]);

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

  // ✅ TABLE COLUMNS
  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "patient_name",
      header: "Patient",
    },
    {
      accessorKey: "appointment_date",
      header: "Date",
    },
    {
      accessorKey: "tranche_horaires",
      header: "Heure",
    },
    {
      accessorKey: "status",
      header: "Statut",
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const appointment = row.original;

        return (
          <Select
            defaultValue={appointment.status}
            onValueChange={(value) => updateStatus(appointment.id, value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="en cours">En cours</SelectItem>
              <SelectItem value="fini">Terminé</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
  ];

  const table = useReactTable({
    data: appointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6 md:p-12">
        {/* ✅ STATS */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card>
            <CardContent className="py-3">
              <div className="border-l pl-2">
                <p className="text-lg font-semibold tracking-widest text-muted-foreground">
                  RENDEZ-VOUS ACCEPTÉS
                </p>
                <p className="text-3xl font-light">{stats.accepted}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <div className="border-l pl-2">
                <p className="text-lg font-semibold tracking-widest text-muted-foreground">
                  RENDEZ-VOUS EN ATTENTE
                </p>
                <p className="text-3xl font-light">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <div className="border-l pl-2">
                <p className="text-lg font-semibold tracking-widest text-muted-foreground">
                  RENDEZ-VOUS REPORTÉS
                </p>
                <p className="text-3xl font-light">{stats.postponed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <div className="border-l pl-2">
                <p className="text-lg font-semibold tracking-widest text-muted-foreground">
                  RENDEZ-VOUS EN COURS
                </p>
                <p className="text-3xl font-light">{stats.in_progress}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <div className="border-l pl-2">
                <p className="text-lg font-semibold tracking-widest text-muted-foreground">
                  RENDEZ-VOUS ANNULÉ
                </p>
                <p className="text-3xl font-light">{stats.cancelled}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <div className="border-l pl-2">
                <p className="text-lg font-semibold tracking-widest text-muted-foreground">
                  RENDEZ-VOUS FINIS
                </p>
                <p className="text-3xl font-light">{stats.done}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✅ TABLE */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
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
                  <TableCell colSpan={columns.length}>Chargement...</TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
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
                  <TableCell colSpan={columns.length}>
                    Aucun rendez-vous
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} sur{" "}
            {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
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
      </main>
    </div>
  );
}
