import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';


export default function Customers() {
  return (
    <React.Fragment>
      <Title>Customers</Title>
      <Table size="small">
      <TableHead>
      <TableRow>
        <TableCell>ID</TableCell>
        <TableCell>Name</TableCell>
        <TableCell>Position</TableCell>
        <TableCell >Version</TableCell>
        <TableCell>Platform</TableCell>
        <TableCell align="right">Last Updated</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableHead>
        <TableBody>
        </TableBody>
      </Table>
    </React.Fragment>
  );
}
