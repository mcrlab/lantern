import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Light from '../Light';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

interface ConfigFormProps {
    confirmCB: any,
    title: String,
    light: Light,
    children?: JSX.Element
}

export default function ConfigForm(props:ConfigFormProps) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const confirm = () => {
    props.confirmCB();
    setOpen(false);

  }
  let rows:Array<React.ReactElement> = Object.keys(props.light.config).map((key:any)=>{
    const value:any = props.light.config[key];
    return (<TableRow>
        <TableCell>{key}</TableCell>
        <TableCell>{value.toString()}</TableCell>
    </TableRow>)
  });
  return (
    <React.Fragment>

    <IconButton  onClick={handleClickOpen}>
        {props.children}
    </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {props.title}
        </DialogTitle>
        <DialogContent>
        <Table size="small">
        <TableHead>
        <TableRow>
            <TableCell>Key</TableCell>
            <TableCell>Value</TableCell>
        </TableRow>
        </TableHead>
            <TableBody>
            {rows}
            </TableBody>
        </Table>

     
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={confirm} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}