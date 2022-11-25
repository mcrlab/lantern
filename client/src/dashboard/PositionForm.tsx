import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { TextField } from '@mui/material';
import Light from '../Light';

interface PositionFormProps {
    title: String,
    light: Light,
    children?: JSX.Element
}

export default function PositionForm(props:PositionFormProps) {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState<Number>(props.light.x);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleKeyPress = (e:any) => {
    if(e.key === "Enter"){
        setPosition(parseInt(e.target.value));
        confirm();
    }
  };

  const confirm = () => {
    fetch(`/api/lights/${props.light.id}/position`,{
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
            "x": position
        })
      })
      .then(response => {
        setOpen(false);
      });
  }
  const handle = (e:any) => {
    const val = e.currentTarget.value;
    setPosition(parseInt(val));
  }
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
        <TextField inputProps={{ inputMode: 'numeric', pattern: '[0-9]*'}}  type="number" defaultValue={position} onBlur={handle} onKeyPress={handleKeyPress} />
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