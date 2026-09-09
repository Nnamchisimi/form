import React from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Toast = ({ open, message, severity, onClose }) => {
  const action = (
    <IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      action={action}
    >
      <Alert onClose={onClose} severity={severity || 'info'} variant="filled" sx={{ width: '100%' }} action={action}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
