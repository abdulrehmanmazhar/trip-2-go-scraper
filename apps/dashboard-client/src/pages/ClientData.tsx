import * as React from 'react'
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import type { ColumnDef } from '@tanstack/react-table'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, SlidersHorizontal } from 'lucide-react'
import Header from '@/components/features/header'

/* ----------------------------- Types ----------------------------- */

type Client = {
    username: string
    email: string
    password: string
    passportNumber: string
    stayedCountry: string
    destinationCountry: string
    paymentStatus: 'Paid' | 'Pending'
    appointmentStatus: 'Booked' | 'Not Booked'
    startDate: string
    endDate: string
    tag: string
}

/* ----------------------------- Data ------------------------------ */

const data: Client[] = [
    {
        username: 'John Doe',
        email: 'john@example.com',
        password: '••••••••',
        passportNumber: 'A1234567',
        stayedCountry: 'Pakistan',
        destinationCountry: 'Italy',
        paymentStatus: 'Paid',
        appointmentStatus: 'Booked',
        startDate: new Date(Date.now()).toLocaleDateString(),
        endDate: new Date(Date.now() + 1000).toLocaleDateString(),
        tag: 'expired'
    },
    {
        username: 'Wowhdfiwy8yerwhdqiwDQB8TG',
        email: 'wow@example.com',
        password: '••••••••',
        passportNumber: 'A1234567',
        stayedCountry: 'Pakistan',
        destinationCountry: 'Italy',
        paymentStatus: 'Paid',
        appointmentStatus: 'Booked',
        startDate: new Date(Date.now()).toLocaleDateString(),
        endDate: new Date(Date.now() + 1000).toLocaleDateString(),
        tag: 'alive'
    }
]

/* --------------------------- Columns ----------------------------- */

const columns: ColumnDef<Client>[] = [
    {
        accessorKey: 'username',
        header: 'User Name',
        size: 180
    },
    {
        accessorKey: 'email',
        header: 'Email',
        size: 220
    },
    {
        accessorKey: 'password',
        header: 'Password',
        size: 120
    },
    {
        accessorKey: 'passportNumber',
        header: 'Passport No.',
        size: 140
    },
    {
        accessorKey: 'stayedCountry',
        header: 'Stayed Country',
        size: 160
    },
    {
        accessorKey: 'destinationCountry',
        header: 'Destination',
        size: 160
    },
    {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        size: 120
    },
    {
        accessorKey: 'appointmentStatus',
        header: 'Appointment',
        size: 140
    },
    {
        accessorKey: 'startDate',
        header: 'Start Date',
        size: 120
    },
    {
        accessorKey: 'endDate',
        header: 'End Date',
        size: 120
    },
    {
        accessorKey: 'tag',
        header: 'Tag',
        size: 100
    }
]

/* --------------------------- Page ----------------------------- */

export default function ClientData() {
    const [globalFilter, setGlobalFilter] = React.useState('')

    const table = useReactTable({
        data,
        columns,
        state: {
            globalFilter
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        columnResizeMode: 'onChange'
    })

    return (
        <div className="bg-background">
            {/* Sticky Header */}

            <Header
                title="Client Data"
                subtitle="Manage client credentials, travel details, and operational status"
                actions={
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Client
                    </Button>
                }
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Input
                        placeholder="Search clients…"
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="max-w-sm h-11"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 h-11">
                                <SlidersHorizontal className="h-4 w-4" />
                                View
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                                        {column.columnDef.header as string}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card overflow-x-auto w-full">
                    <Table className="table-fixed w-full">
                        <TableHeader className="sticky top-0 bg-card z-20">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            style={{ width: header.getSize() }}
                                            className="whitespace-nowrap">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell
                                                key={cell.id}
                                                style={{ width: cell.column.getSize() }}
                                                className="truncate whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-muted-foreground">
                                        No results found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
