
import React, { useState } from 'react';
import { Popover, Button, TextField } from '@mui/material';

interface CommentPopoverProps {
  anchorEl: HTMLElement | null; 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (comment: string) => void; 
}

const CommentPopover: React.FC<CommentPopoverProps> = ({ anchorEl, open, onClose, onSubmit }) => {
  const [comment, setComment] = useState('');

  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  
  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment);
      setComment(''); 
      onClose(); 
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <div style={{ padding: '16px' }}>
        <TextField
          label="Your Comment"
          multiline
          fullWidth
          value={comment}
          onChange={handleChange}
          rows={4}
          margin="normal"
        />
        <Button variant="contained" color="secondary" onClick={handleSubmit} fullWidth>
          Submit Comment
        </Button>
      </div>
    </Popover>
  );
};

export default CommentPopover;
