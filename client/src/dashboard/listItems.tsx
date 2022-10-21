import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import {Link} from "react-router-dom";
import ColorLensIcon from '@mui/icons-material/ColorLens';

export const mainListItems = (
  <React.Fragment>
    <Link to="/">
      <ListItemButton>
        <ListItemIcon>
          <LightbulbIcon />
        </ListItemIcon>
        <ListItemText primary="Lights" />
      </ListItemButton>
    </Link>
    <Link to="/display">
      <ListItemButton>
        <ListItemIcon>
          <ColorLensIcon />
        </ListItemIcon>
        <ListItemText primary="Display" />
      </ListItemButton>
    </Link>
  </React.Fragment>
);
