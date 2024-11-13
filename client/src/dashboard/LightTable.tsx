import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import LightArray from '../LightArray';
import LightItem from './LightItem';


export default function LightTable(props:LightArray) {
  return (
    <React.Fragment>
      <Title>Lights</Title>
      <Table size="small">
      <TableHead>
      <TableRow>
        <TableCell>ID</TableCell>
        <TableCell>Name</TableCell>
        <TableCell>Position</TableCell>
        <TableCell>Color</TableCell>
        <TableCell align="right">Last Updated</TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableHead>
        <TableBody>
          {props.lights.map((light) => (
            <LightItem key={light.id} light={light} />
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}
