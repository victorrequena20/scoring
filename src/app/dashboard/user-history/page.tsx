'use client';

import { Grid, Typography } from '@mui/material';
import React from 'react';
import { _bookingReview, _userAbout } from 'src/_mock';
import { useMockedUser } from 'src/auth/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { ProfileCover } from 'src/sections/user/profile-cover';
import Card from '@mui/material/Card';
import { Box } from '@mui/material';
import { BookingAvailable } from 'src/sections/overview/booking/booking-available';
import { BookingCustomerReviews } from 'src/sections/overview/booking/booking-customer-reviews';
import { BankingExpensesCategories } from 'src/sections/overview/banking/banking-expenses-categories';
import { Iconify } from 'src/components/iconify';

import { useState, useCallback } from 'react';
import { AnalyticsWidgetSummary } from 'src/sections/overview/analytics/analytics-widget-summary';
import { CONFIG } from 'src/config-global';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { varAlpha } from 'src/theme/styles';
import { _roles, _userList, USER_STATUS_OPTIONS } from 'src/_mock';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import {
  useTable,
  emptyRows,
  rowInPage,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';
import { IUserItem, IUserTableFilters } from 'src/types/user';
import { UserTableToolbar } from 'src/sections/user/user-table-toolbar';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';
import { UserTableRow } from 'src/sections/user/user-table-row';
import { ProductList } from 'src/sections/product/product-list';

type ApplyFilterProps = {
  inputData: IUserItem[];
  filters: IUserTableFilters;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filters }: ApplyFilterProps) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => role.includes(user.role));
  }

  return inputData;
}

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'phoneNumber', label: 'Phone number', width: 180 },
  { id: 'company', label: 'Company', width: 220 },
  { id: 'role', label: 'Role', width: 180 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

export default function UserHistoryPage() {
  const { user } = useMockedUser();
  const table = useTable();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState<IUserItem[]>(_userList);

  const filters = useSetState<IUserTableFilters>({ name: '', role: [], status: 'all' });

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters.state,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!filters.state.name || filters.state.role.length > 0 || filters.state.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter((row) => row.id !== id);

      toast.success('Delete success!');

      setTableData(deleteRow);

      table.onUpdatePageDeleteRow(dataInPage.length);
    },
    [dataInPage.length, table, tableData]
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    toast.success('Delete success!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, table, tableData]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Card sx={{ mb: 3, height: 290, mt: 4 }}>
        <ProfileCover
          role={'Última actualización: Ayer'}
          name={'Jose Deudita'}
          avatarUrl={user?.photoURL}
          coverUrl={''}
        />
      </Card>
      <Grid container xs={12} spacing={4}>
        <Grid item md={6}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <BookingAvailable
              title="Puntaje de Crédito"
              chart={{
                series: [
                  { label: 'Pagado', value: 180 },
                  { label: 'No pagado', value: 66 },
                  { label: 'Atrasado', value: 10 },
                ],
              }}
            />
          </Box>
        </Grid>
        <Grid item md={6}>
          <BankingExpensesCategories
            title="Resumen Financiero"
            chart={{
              series: [
                { label: 'Prestamos personales', value: 22 },
                { label: 'Prestamos hipotecarios', value: 10 },
                { label: 'Tarjetas de crédito', value: 21 },
              ],
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <ProductList products={[]} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
