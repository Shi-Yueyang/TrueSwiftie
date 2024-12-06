import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Box } from '@mui/material';

const SmoothImageTransition = () => {
  // Initial image source
  const [imageSrc, setImageSrc] = useState('https://via.placeholder.com/300x200?text=Image+1');
  
  // Toggle image source on button click
  const handleClick = () => {
    const newSrc = imageSrc === 'https://via.placeholder.com/300x200?text=Image+1'
      ? 'https://via.placeholder.com/300x200?text=Image+2'
      : 'https://via.placeholder.com/300x200?text=Image+1';

    setImageSrc(newSrc);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 2 }}>
      <motion.img
        src={imageSrc}
        alt="transitioning image"
        style={{ width: '300px', height: '200px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }} // Duration of transition
      />
      <Button variant="contained" color="primary" onClick={handleClick} sx={{ marginTop: 2 }}>
        Change Image
      </Button>
    </Box>
  );
};

export default SmoothImageTransition;
