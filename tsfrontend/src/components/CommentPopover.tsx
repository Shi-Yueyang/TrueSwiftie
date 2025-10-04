import React, { useMemo, useState } from 'react';
import { Popover, Button, TextField, Box, Typography, Stack } from '@mui/material';

interface CommentPopoverProps {
  anchorEl: HTMLElement | null; 
  open: boolean; 
  onClose: () => void; 
  onSubmit: (comment: string) => void; 
}

const MAX_LEN = 280;

const CommentPopover: React.FC<CommentPopoverProps> = ({ anchorEl, open, onClose, onSubmit }) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const remaining = useMemo(() => MAX_LEN - comment.length, [comment]);
  const tooLong = remaining < 0;
  const isEmpty = comment.trim().length === 0;

  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  
  const handleSubmit = () => {
    if (isEmpty || tooLong || submitting) return;
    setSubmitting(true);
    try {
      onSubmit(comment.trim());
      setComment('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
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
      <Box sx={{ p: 2, width: { xs: 280, sm: 360 } }}>

        <TextField
          placeholder="Share your thoughts..."
          label="Comment"
          variant="outlined"
          multiline
          fullWidth
          value={comment}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={4}
          autoFocus
          inputProps={{ maxLength: MAX_LEN + 50 }}
          error={tooLong}

        />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="caption" color={tooLong ? 'error' : 'text.secondary'}>
            {remaining} characters left
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={isEmpty || tooLong || submitting}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
};

export default CommentPopover;
