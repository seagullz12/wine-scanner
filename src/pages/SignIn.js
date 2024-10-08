import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, signInWithEmailAndPassword, sendPasswordResetEmail } from '../components/firebase-config';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Snackbar,
  Alert
} from '@mui/material';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();

  // Handle sign-in logic
  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to Home page after successful sign-in
    } catch (error) {
      setError('Failed to sign in. Please check your email and password.');
      console.error('Sign In Error:', error);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Reset email sent successfully to', email);
      setResetMessage('Password reset email sent! Please check your inbox.');
      setError('');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error sending reset email:', error);
      setError('Failed to send reset email. Please make sure the email is correct.');
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Sign In
        </Typography>
        <form onSubmit={handleSignIn}>
          <TextField
            variant="outlined"
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Sign In
          </Button>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          {resetMessage && (
            <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
              {resetMessage}
            </Typography>
          )}
        </form>

        {/* Reset Password Link */}
        <Typography variant="body2" sx={{ mt: 2 }}>
          Forgot your password?{' '}
          <Button variant="text" onClick={handlePasswordReset}>
            Reset Password
          </Button>
        </Typography>
      </Box>

      {/* Snackbar for success message */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {resetMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SignIn;
